/**
 * Select-submenu algorithm tests — the TS port of
 * updateSelectMenu / _selectWidgetsTypeAndOrName.
 */

import { describe, it, expect } from 'vitest';
import { buildSelectOptions } from './treeselect';
import type { WidgetTreeNode } from '../../rpc/types';

// Two pages, each with a graph + x/y axes; page1 also has a second
// graph so "all axis widgets" spans more than one parent.
const TREE: WidgetTreeNode = {
  name: '', path: '/', type: 'document',
  children: [
    {
      name: 'page1', path: '/page1', type: 'page',
      children: [
        {
          name: 'graph1', path: '/page1/graph1', type: 'graph',
          children: [
            { name: 'x', path: '/page1/graph1/x', type: 'axis', children: [] },
            { name: 'y', path: '/page1/graph1/y', type: 'axis', children: [] },
            { name: 'xy1', path: '/page1/graph1/xy1', type: 'xy', children: [] },
          ],
        },
        {
          name: 'graph2', path: '/page1/graph2', type: 'graph',
          children: [
            { name: 'x', path: '/page1/graph2/x', type: 'axis', children: [] },
            { name: 'y', path: '/page1/graph2/y', type: 'axis', children: [] },
          ],
        },
      ],
    },
    {
      name: 'page2', path: '/page2', type: 'page',
      children: [
        {
          name: 'graph1', path: '/page2/graph1', type: 'graph',
          children: [
            { name: 'x', path: '/page2/graph1/x', type: 'axis', children: [] },
          ],
        },
      ],
    },
  ],
};

function byLabel(opts: ReturnType<typeof buildSelectOptions>, frag: string) {
  return opts.find((o) => o.label.includes(frag));
}

describe('buildSelectOptions', () => {
  it('returns [] for a missing path', () => {
    expect(buildSelectOptions(TREE, '/no/such')).toEqual([]);
    expect(buildSelectOptions(null, '/page1')).toEqual([]);
  });

  it('"All TYPE widgets" spans the whole document', () => {
    const opts = buildSelectOptions(TREE, '/page1/graph1/x');
    const all = byLabel(opts, "All 'axis' widgets");
    expect(all).toBeDefined();
    expect(new Set(all!.paths)).toEqual(new Set([
      '/page1/graph1/x', '/page1/graph1/y',
      '/page1/graph2/x', '/page1/graph2/y',
      '/page2/graph1/x',
    ]));
  });

  it('"Siblings of NAME with type TYPE" excludes the widget itself', () => {
    const opts = buildSelectOptions(TREE, '/page1/graph1/x');
    const sib = byLabel(opts, 'Siblings of');
    expect(sib).toBeDefined();
    // graph1's only other axis is y; xy1 is a different type.
    expect(sib!.paths).toEqual(['/page1/graph1/y']);
  });

  it('"All TYPE widgets called NAME" matches type AND name', () => {
    const opts = buildSelectOptions(TREE, '/page1/graph1/x');
    const tn = byLabel(opts, "All 'axis' widgets called 'x'");
    expect(new Set(tn!.paths)).toEqual(new Set([
      '/page1/graph1/x', '/page1/graph2/x', '/page2/graph1/x',
    ]));
  });

  it('"All widgets called NAME" matches name across types', () => {
    // graph1 appears on page1 and page2 with the same name.
    const opts = buildSelectOptions(TREE, '/page1/graph1');
    const nm = byLabel(opts, "All widgets called 'graph1'");
    expect(new Set(nm!.paths)).toEqual(new Set([
      '/page1/graph1', '/page2/graph1',
    ]));
  });

  it('adds an on-page selector scoped to the enclosing page', () => {
    const opts = buildSelectOptions(TREE, '/page1/graph1/x');
    const onPage = byLabel(opts, "on page 'page1'");
    expect(onPage).toBeDefined();
    // Only x axes within page1 — not page2.
    expect(new Set(onPage!.paths)).toEqual(new Set([
      '/page1/graph1/x', '/page1/graph2/x',
    ]));
  });

  it('omits the on-page selector when the target is itself a page', () => {
    const opts = buildSelectOptions(TREE, '/page1');
    expect(byLabel(opts, 'on page')).toBeUndefined();
  });
});
