import { describe, it, expect } from 'vitest';
import {
  rotate3, rotToAngles, composeDragRotation, computeRotateOps, findScene3dPath,
  type Angles,
} from './rotate3d';
import type { WidgetTreeNode } from '../rpc/types';

const DEG2RAD = Math.PI / 180;
const near = (a: number, b: number, eps = 1e-6) => Math.abs(a - b) <= eps;

describe('rotate3 / rotToAngles round-trip', () => {
  // rotM_to_angles inverts rotate3M4 for angles inside the decomposition's
  // principal range (|x|,|z| ≤ 180, |y| ≤ 90 — beyond ±90 in y the Euler
  // branch aliases, which is expected and matches the desktop).
  const cases: Angles[] = [
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 35, z: 0 },
    { x: 12, y: -40, z: 25 },
    { x: -80, y: 10, z: 170 },
    { x: 45, y: 60, z: -30 },
  ];
  for (const a of cases) {
    it(`recovers (${a.x}, ${a.y}, ${a.z})`, () => {
      const m = rotate3(a.x * DEG2RAD, a.y * DEG2RAD, a.z * DEG2RAD);
      const got = rotToAngles(m);
      expect(near(got.x, a.x, 1e-4)).toBe(true);
      expect(near(got.y, a.y, 1e-4)).toBe(true);
      expect(near(got.z, a.z, 1e-4)).toBe(true);
    });
  }
});

describe('composeDragRotation', () => {
  it('a zero drag leaves the angles unchanged', () => {
    const start = { x: 10, y: 35, z: -5 };
    const got = composeDragRotation(start, 0, 0, 'xy');
    expect(near(got.x, start.x, 1e-6)).toBe(true);
    expect(near(got.y, start.y, 1e-6)).toBe(true);
    expect(near(got.z, start.z, 1e-6)).toBe(true);
  });

  it('from the identity pose, a horizontal drag yaws about Y (xy mode)', () => {
    // deltaM = rotate3(0, -dx, 0): pure Y rotation of -dx degrees.
    const got = composeDragRotation({ x: 0, y: 0, z: 0 }, 20, 0, 'xy');
    expect(near(got.x, 0, 1e-6)).toBe(true);
    expect(near(got.y, -20, 1e-4)).toBe(true);
    expect(near(got.z, 0, 1e-6)).toBe(true);
  });

  it('from the identity pose, a vertical drag pitches about X (xy mode)', () => {
    const got = composeDragRotation({ x: 0, y: 0, z: 0 }, 0, 15, 'xy');
    expect(near(got.x, -15, 1e-4)).toBe(true);
    expect(near(got.y, 0, 1e-6)).toBe(true);
    expect(near(got.z, 0, 1e-6)).toBe(true);
  });

  it('xz mode rolls about Z on vertical drag', () => {
    const got = composeDragRotation({ x: 0, y: 0, z: 0 }, 0, 12, 'xz');
    expect(near(got.z, -12, 1e-4)).toBe(true);
    expect(near(got.y, 0, 1e-6)).toBe(true);
  });

  it('is deterministic in total displacement (no per-move drift)', () => {
    // One 30px drag must equal the same endpoint reached in two recomputes,
    // because each call composes from `start`, not the previous result.
    const start = { x: 5, y: 20, z: 0 };
    const direct = composeDragRotation(start, 30, 10, 'xy');
    const recomputed = composeDragRotation(start, 30, 10, 'xy');
    expect(direct).toEqual(recomputed);
  });
});

describe('computeRotateOps', () => {
  it('emits the three rotation settings, rounded to 0.1°', () => {
    const ops = computeRotateOps('/page1/scene3d1', { x: 0, y: 0, z: 0 }, 20, 0, 'xy');
    expect(ops).toEqual([
      { path: '/page1/scene3d1/xRotation', value: 0 },
      { path: '/page1/scene3d1/yRotation', value: -20 },
      { path: '/page1/scene3d1/zRotation', value: 0 },
    ]);
  });

  it('rounds odd angles to one decimal', () => {
    const ops = computeRotateOps('/p/s', { x: 0, y: 0, z: 0 }, 13.37, 0, 'xy');
    const y = ops.find((o) => o.path === '/p/s/yRotation')!.value as number;
    expect(y).toBeCloseTo(-13.4, 5);
    expect(Number.isInteger(Math.round(y * 10))).toBe(true);
  });
});

describe('findScene3dPath', () => {
  const leaf = (type: string, path: string): WidgetTreeNode =>
    ({ name: path, path, type, children: [] });

  it('finds a nested scene3d and returns its path', () => {
    const tree: WidgetTreeNode = {
      name: 'page1', path: '/page1', type: 'page',
      children: [
        leaf('graph', '/page1/graph1'),
        { name: 'scene3d1', path: '/page1/scene3d1', type: 'scene3d',
          children: [leaf('graph3d', '/page1/scene3d1/graph3d1')] },
      ],
    };
    expect(findScene3dPath(tree)).toBe('/page1/scene3d1');
  });

  it('returns null for a 2D-only page', () => {
    const tree: WidgetTreeNode = {
      name: 'page1', path: '/page1', type: 'page',
      children: [leaf('graph', '/page1/graph1')],
    };
    expect(findScene3dPath(tree)).toBeNull();
  });

  it('returns null for null/undefined input', () => {
    expect(findScene3dPath(null)).toBeNull();
    expect(findScene3dPath(undefined)).toBeNull();
  });
});
