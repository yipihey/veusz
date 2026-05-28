/**
 * Port of Veusz's "Select" submenu logic
 * (treeeditwindow.py:_selectWidgetsTypeAndOrName / _selectWidgetSiblings /
 * updateSelectMenu, lines 1422–1484).
 *
 * Pure tree-walks over the cached `doc.tree` JSON — no daemon round
 * trip. Each builder returns a list of widget paths to select.
 */

import type { WidgetTreeNode } from '../../rpc/types';

export interface SelectOption {
  /** Menu label, e.g. "All 'axis' widgets". */
  label: string;
  /** Paths to select when chosen. */
  paths: string[];
}

function findNode(root: WidgetTreeNode, path: string): WidgetTreeNode | null {
  if (root.path === path) return root;
  for (const c of root.children) {
    const r = findNode(c, path);
    if (r) return r;
  }
  return null;
}

function findParent(
  root: WidgetTreeNode,
  path: string,
): WidgetTreeNode | null {
  for (const c of root.children) {
    if (c.path === path) return root;
    const r = findParent(c, path);
    if (r) return r;
  }
  return null;
}

/** Walk a subtree, collecting paths of every widget matching type
 *  and/or name. Pass null to ignore a criterion. */
function walkMatching(
  root: WidgetTreeNode,
  wtype: string | null,
  wname: string | null,
): string[] {
  const out: string[] = [];
  const walk = (n: WidgetTreeNode) => {
    if ((wtype === null || n.type === wtype) &&
        (wname === null || n.name === wname)) {
      out.push(n.path);
    }
    for (const c of n.children) walk(c);
  };
  // Don't match the document root itself; start from its children.
  for (const c of root.children) walk(c);
  return out;
}

/** The nearest enclosing page node for `path`, or null. */
function pageOf(root: WidgetTreeNode, path: string): WidgetTreeNode | null {
  // Walk down the path segments tracking the last page seen.
  let page: WidgetTreeNode | null = null;
  let node: WidgetTreeNode | null = root;
  const target = findNode(root, path);
  if (!target) return null;
  // Re-descend tracking page ancestors.
  const parts = path.split('/').filter(Boolean);
  let cur = root;
  for (const part of parts) {
    const next: WidgetTreeNode | undefined =
      cur.children.find((c) => c.name === part);
    if (!next) break;
    if (next.type === 'page') page = next;
    cur = next;
  }
  void node;
  return page;
}

/**
 * Build the Select submenu for the widget at `path`, mirroring
 * Veusz's `updateSelectMenu`. Returns [] if the path isn't found.
 */
export function buildSelectOptions(
  root: WidgetTreeNode | null,
  path: string,
): SelectOption[] {
  if (!root) return [];
  const node = findNode(root, path);
  if (!node) return [];
  const wtype = node.type;
  const name = node.name;

  const options: SelectOption[] = [];

  // 1. All 'TYPE' widgets
  options.push({
    label: `All '${wtype}' widgets`,
    paths: walkMatching(root, wtype, null),
  });

  // 2. Siblings of 'NAME' with type 'TYPE'
  const parent = findParent(root, path);
  const siblings = parent
    ? parent.children
        .filter((c) => c.path !== path && c.type === wtype)
        .map((c) => c.path)
    : [];
  options.push({
    label: `Siblings of '${name}' with type '${wtype}'`,
    paths: siblings,
  });

  // 3. All 'TYPE' widgets called 'NAME'
  options.push({
    label: `All '${wtype}' widgets called '${name}'`,
    paths: walkMatching(root, wtype, name),
  });

  // 4. All widgets called 'NAME'
  options.push({
    label: `All widgets called '${name}'`,
    paths: walkMatching(root, null, name),
  });

  // 5. All widgets called 'NAME' on page 'PAGE' (only if the target is
  //    not itself the page).
  const page = pageOf(root, path);
  if (page && page.path !== path) {
    options.push({
      label: `All widgets called '${name}' on page '${page.name}'`,
      paths: walkMatching(page, null, name),
    });
  }

  return options;
}
