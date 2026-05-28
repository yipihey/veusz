/**
 * Multi-select gesture math for the widget tree.
 *
 * Pure functions so they can be unit-tested without React:
 *  - `flattenTreePaths` produces the visible top-to-bottom path order
 *    used for Shift-range selection.
 *  - `computeSelection` applies a click (replace / toggle / range)
 *    against the current selection and anchor.
 */

import type { WidgetTreeNode } from '../../rpc/types';
import type { SelectMode } from '../tree/Tree';

/** Depth-first, parent-before-children path list — the visual order
 *  rows appear in the tree. The document root ('/') is included. */
export function flattenTreePaths(root: WidgetTreeNode | null): string[] {
  const out: string[] = [];
  const walk = (n: WidgetTreeNode) => {
    out.push(n.path);
    for (const c of n.children) walk(c);
  };
  if (root) walk(root);
  return out;
}

export interface SelectionResult {
  selection: string[];
  anchor: string;
}

/**
 * Compute the new selection after a click.
 *
 * @param current  current selected paths
 * @param path     the clicked row's path
 * @param mode     'replace' | 'toggle' | 'range'
 * @param order    flattened visible path order (for range)
 * @param anchor   the anchor path for range selection (usually the
 *                 last plainly-clicked row)
 */
export function computeSelection(
  current: string[],
  path: string,
  mode: SelectMode,
  order: string[],
  anchor: string | null,
): SelectionResult {
  if (mode === 'toggle') {
    const has = current.includes(path);
    const selection = has
      ? current.filter((p) => p !== path)
      : [...current, path];
    // Toggling sets the anchor to the just-clicked row.
    return { selection, anchor: path };
  }

  if (mode === 'range') {
    const from = anchor ?? path;
    const i = order.indexOf(from);
    const j = order.indexOf(path);
    if (i === -1 || j === -1) {
      return { selection: [path], anchor: path };
    }
    const [lo, hi] = i <= j ? [i, j] : [j, i];
    const selection = order.slice(lo, hi + 1);
    // Range keeps the original anchor so a subsequent shift-click
    // re-extends from the same origin.
    return { selection, anchor: from };
  }

  // replace
  return { selection: [path], anchor: path };
}
