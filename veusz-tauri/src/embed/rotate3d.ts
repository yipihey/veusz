/**
 * Drag-to-rotate maths for embedded 3D scenes (`scene3d` widgets).
 *
 * Mirrors the desktop `_SceneRotationItem` controlgraph: a screen-space drag is
 * an *incremental* rotation that pre-multiplies the scene's current rotation
 * matrix; the product is then decomposed back into the three Euler angles the
 * `Scene3D` widget stores (`xRotation`, `yRotation`, `zRotation`, in degrees).
 *
 * Why matrices and not just `angle += delta`: Euler angles don't commute, so
 * adding a screen-x drag straight onto `yRotation` tilts the wrong way once the
 * scene is already pitched. Composing rotation matrices in *screen* space and
 * re-decomposing keeps the drag feeling locked to the pointer at any pose.
 *
 * The rotation matrix this mirrors is `veusz/helpers/threed_py.py`'s
 * `rotate3M4(x, y, z) = Rx·Ry·Rz` — the engine that actually renders 3D in the
 * browser (the compiled C++ extension is absent under Pyodide). We decompose
 * with the *exact* inverse of that product rather than porting the desktop
 * `rotM_to_angles`, which assumes the opposite multiply order and so doesn't
 * round-trip threed_py's matrices (verified numerically). All pure functions,
 * no DOM/store dependency, so they unit-test directly.
 */

import type { SetOp } from './navigate';
import type { WidgetTreeNode } from '../rpc/types';

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

/** A 3×3 rotation matrix, row-major: m[row][col]. */
type Mat3 = [
  [number, number, number],
  [number, number, number],
  [number, number, number],
];

/** Euler angles in degrees, matching the Scene3D settings. */
export interface Angles { x: number; y: number; z: number }

/** Which screen axes a drag rotates around. 'xy' (default) pitches on vertical
 *  drag and yaws on horizontal; 'xz' (held modifier) rolls instead of yaws. */
export type RotateMode = 'xy' | 'xz';

function matmul(a: Mat3, b: Mat3): Mat3 {
  const out: Mat3 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      out[i][j] = a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j];
    }
  }
  return out;
}

/** Rotation about the principal X axis (matches threed_py `rotateM4(a,(1,0,0))`). */
function rotX(a: number): Mat3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [[1, 0, 0], [0, c, -s], [0, s, c]];
}
function rotY(a: number): Mat3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [[c, 0, s], [0, 1, 0], [-s, 0, c]];
}
function rotZ(a: number): Mat3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [[c, -s, 0], [s, c, 0], [0, 0, 1]];
}

/** `rotate3M4(ax, ay, az)` = Rx·Ry·Rz, angles in radians. */
export function rotate3(ax: number, ay: number, az: number): Mat3 {
  return matmul(matmul(rotX(ax), rotY(ay)), rotZ(az));
}

/**
 * Decompose a rotation matrix back to (x, y, z) Euler angles in degrees — the
 * exact inverse of `rotate3(x, y, z) = Rx·Ry·Rz`. For that product:
 *   m02 = sin(y),  m01 = -cos(y)sin(z),  m00 = cos(y)cos(z),
 *   m12 = -sin(x)cos(y),  m22 = cos(x)cos(y).
 * So y = asin(m02); away from the y = ±90° gimbal singularity x and z read off
 * the remaining entries. At the singularity cos(y) ≈ 0 only x+z is observable,
 * so we pin z = 0 and fold the whole turn into x.
 */
export function rotToAngles(m: Mat3): Angles {
  const sy = Math.max(-1, Math.min(1, m[0][2]));
  const y = Math.asin(sy);
  let x: number, z: number;
  if (Math.abs(sy) < 1 - 1e-9) {
    x = Math.atan2(-m[1][2], m[2][2]);
    z = Math.atan2(-m[0][1], m[0][0]);
  } else {
    // Gimbal lock: cos(y) ≈ 0. Only x+z is determined; choose z = 0.
    x = Math.atan2(m[2][1], m[1][1]);
    z = 0;
  }
  return { x: x * RAD2DEG, y: y * RAD2DEG, z: z * RAD2DEG };
}

/**
 * Given the angles at drag start and the *total* pointer displacement since
 * then (in degrees — pixels × sensitivity), return the new Euler angles.
 *
 * Computing from the start pose each move (rather than accumulating per-move
 * deltas) makes the gesture deterministic: a given pointer offset always maps
 * to the same orientation, so throttled/dropped move events never drift.
 */
export function composeDragRotation(
  start: Angles, dxDeg: number, dyDeg: number, mode: RotateMode = 'xy',
): Angles {
  const startM = rotate3(start.x * DEG2RAD, start.y * DEG2RAD, start.z * DEG2RAD);
  // Screen-space increment: vertical drag → rotate about screen X; horizontal
  // drag → about screen Y (xy) or screen Z (xz). Signs match the desktop.
  const deltaM = mode === 'xy'
    ? rotate3(-dyDeg * DEG2RAD, -dxDeg * DEG2RAD, 0)
    : rotate3(-dxDeg * DEG2RAD, 0, -dyDeg * DEG2RAD);
  return rotToAngles(matmul(deltaM, startM));
}

// Round to 0.1° and fold -0 into 0 so the document never records "-0".
const round1 = (v: number) => (Math.round(v * 10) || 0) / 10;

/**
 * Build the `doc.set` ops that rotate a scene to new angles. Angles are
 * rounded to 0.1° (matching the desktop control) to keep the document tidy.
 */
export function computeRotateOps(
  scenePath: string, start: Angles, dxDeg: number, dyDeg: number,
  mode: RotateMode = 'xy',
): SetOp[] {
  const a = composeDragRotation(start, dxDeg, dyDeg, mode);
  return [
    { path: `${scenePath}/xRotation`, value: round1(a.x) },
    { path: `${scenePath}/yRotation`, value: round1(a.y) },
    { path: `${scenePath}/zRotation`, value: round1(a.z) },
  ];
}

/**
 * Depth-first search a widget subtree for the first `scene3d` node, returning
 * its path (the settings base for xRotation/yRotation/zRotation) or null. Used
 * to decide whether a drag on the current page should rotate rather than zoom.
 */
export function findScene3dPath(node: WidgetTreeNode | null | undefined): string | null {
  if (!node) return null;
  if (node.type === 'scene3d') return node.path;
  for (const c of node.children) {
    const hit = findScene3dPath(c);
    if (hit) return hit;
  }
  return null;
}
