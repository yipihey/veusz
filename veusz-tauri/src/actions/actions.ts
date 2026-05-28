/**
 * The action set — mirrors the Qt app's `vzactions`. Each action is
 * declarative (label/shortcut/run/enabled) and references the store or host
 * hooks via ActionCtx. Selection ops funnel through keys/shortcuts.ts
 * `dispatch` so the keyboard, menus, and toolbars share one code path.
 *
 * Phase 0 wires everything that already has a daemon RPC / store action.
 * Items whose backend lands in a later phase call `openDialog` (routed to an
 * existing component) or `notify` a "coming soon" message; they're marked so
 * we can track parity.
 */

import type { DocState } from '../state/doc';
import { dispatch } from '../keys/shortcuts';
import type { Action } from './types';

const hasSel = (s: DocState) => s.selected.length > 0;

/** (typename, label) for the Insert menu — mirrors Qt's add.* set. */
export const INSERT_WIDGETS: { group: string; items: [string, string][] }[] = [
  { group: 'Pages & Graphs', items: [
    ['page', 'Page'], ['grid', 'Grid'], ['graph', 'Graph'],
    ['graph3d', '3D Graph'], ['scene3d', '3D Scene'],
  ]},
  { group: 'Axes', items: [
    ['axis', 'Axis'], ['axis-broken', 'Broken Axis'],
    ['axis-function', 'Function Axis'], ['axis3d', '3D Axis'],
  ]},
  { group: 'Plotters', items: [
    ['xy', 'Points (XY)'], ['function', 'Function'], ['bar', 'Bar chart'],
    ['histo', 'Histogram'], ['boxplot', 'Box plot'], ['fit', 'Fit'],
    ['image', 'Image'], ['contour', 'Contour'], ['vectorfield', 'Vector field'],
    ['covariance', 'Covariance'], ['polar', 'Polar'], ['ternary', 'Ternary'],
    ['nonorthpoint', 'Non-orth. points'], ['nonorthfunc', 'Non-orth. function'],
  ]},
  { group: '3D plotters', items: [
    ['point3d', '3D points'], ['function3d', '3D function'],
    ['surface3d', '3D surface'], ['volume3d', '3D volume'],
  ]},
  { group: 'Annotations', items: [
    ['key', 'Key / legend'], ['label', 'Text label'], ['colorbar', 'Colorbar'],
  ]},
  { group: 'Shapes', items: [
    ['rect', 'Rectangle'], ['ellipse', 'Ellipse'], ['line', 'Line'],
    ['polygon', 'Polygon'], ['imagefile', 'Image file'], ['svgfile', 'SVG file'],
  ]},
];

function insertActions(): Record<string, Action> {
  const out: Record<string, Action> = {};
  for (const { items } of INSERT_WIDGETS) {
    for (const [type, label] of items) {
      out[`add.${type}`] = {
        id: `add.${type}`,
        label,
        // Enabled only when the current selection has a valid place for this
        // widget; placed at the daemon-resolved parent (self or nearest
        // ancestor — adds as a sibling for leaf selections, like Qt).
        enabled: (s) => type in s.insertTargets,
        run: ({ store }) => {
          const s = store.getState();
          const parent = s.insertTargets[type];
          if (parent) void s.addWidget(parent, type);
        },
      };
    }
  }
  return out;
}

export const ACTIONS: Record<string, Action> = {
  // ---- File -----------------------------------------------------------
  'file.new': {
    id: 'file.new', label: 'New', shortcut: 'Ctrl+N',
    run: ({ store }) => { void store.getState().newDocument('graph'); },
  },
  'file.open': {
    id: 'file.open', label: 'Open…', shortcut: 'Ctrl+O',
    run: async ({ store, pick, notify }) => {
      if (!pick.vsz) return notify('No file picker available.');
      const p = await pick.vsz();
      if (p) await store.getState().openFile(p);
    },
  },
  'file.save': {
    id: 'file.save', label: 'Save', shortcut: 'Ctrl+S',
    run: async ({ store, pick }) => {
      const s = store.getState();
      if (s.filename) { await s.saveFile(); return; }
      const p = await pick.savePath?.();
      if (p) await s.saveFileAs(p);
    },
  },
  'file.saveas': {
    id: 'file.saveas', label: 'Save As…',
    run: async ({ store, pick, notify }) => {
      if (!pick.savePath) return notify('No save picker available.');
      const p = await pick.savePath();
      if (p) await store.getState().saveFileAs(p);
    },
  },
  'file.export': {
    id: 'file.export', label: 'Export…',
    enabled: (s) => !!s.tree && s.tree.children.length > 0,
    run: ({ openDialog }) => openDialog('export'),
  },
  'file.close': {
    id: 'file.close', label: 'Close Window', shortcut: 'Ctrl+W',
    run: ({ notify }) => notify('Close handled by the window manager.'),
  },

  // ---- Edit -----------------------------------------------------------
  'edit.undo': {
    id: 'edit.undo', label: 'Undo', shortcut: 'Ctrl+Z',
    enabled: (s) => s.canUndo, run: ({ store }) => dispatch('undo', store),
  },
  'edit.redo': {
    id: 'edit.redo', label: 'Redo', shortcut: 'Ctrl+Shift+Z',
    enabled: (s) => s.canRedo, run: ({ store }) => dispatch('redo', store),
  },
  'edit.cut': {
    id: 'edit.cut', label: 'Cut', shortcut: 'Ctrl+X',
    enabled: hasSel, run: ({ store }) => dispatch('cut', store),
  },
  'edit.copy': {
    id: 'edit.copy', label: 'Copy', shortcut: 'Ctrl+C',
    enabled: hasSel, run: ({ store }) => dispatch('copy', store),
  },
  'edit.paste': {
    id: 'edit.paste', label: 'Paste', shortcut: 'Ctrl+V',
    enabled: hasSel, run: ({ store }) => dispatch('paste', store),
  },
  'edit.copyimage': {
    id: 'edit.copyimage', label: 'Copy as image', shortcut: 'Ctrl+Alt+C',
    enabled: (s) => !!s.render, run: ({ store }) => dispatch('copyAsImage', store),
  },
  'edit.delete': {
    id: 'edit.delete', label: 'Delete', shortcut: 'Del',
    enabled: hasSel, run: ({ store }) => dispatch('delete', store),
  },
  'edit.moveup': {
    id: 'edit.moveup', label: 'Move up', shortcut: 'Ctrl+Shift+PgUp',
    enabled: hasSel, run: ({ store }) => dispatch('moveUp', store),
  },
  'edit.movedown': {
    id: 'edit.movedown', label: 'Move down', shortcut: 'Ctrl+Shift+PgDn',
    enabled: hasSel, run: ({ store }) => dispatch('moveDown', store),
  },
  'edit.prefs': {
    id: 'edit.prefs', label: 'Preferences…',
    run: ({ openDialog }) => openDialog('preferences'),
  },
  'edit.stylesheet': {
    id: 'edit.stylesheet', label: 'Default styles…',
    run: ({ openDialog }) => openDialog('stylesheet'),
  },
  'edit.custom': {
    id: 'edit.custom', label: 'Custom definitions…',
    run: ({ openDialog }) => openDialog('custom'),
  },

  // ---- View -----------------------------------------------------------
  'view.prevpage': {
    id: 'view.prevpage', label: 'Previous page', shortcut: 'Ctrl+PgUp',
    enabled: (s) => s.currentPage > 0,
    run: ({ store }) => store.getState().prevPage(),
  },
  'view.nextpage': {
    id: 'view.nextpage', label: 'Next page', shortcut: 'Ctrl+PgDn',
    enabled: (s) => s.currentPage < ((s.tree?.children.length ?? 1) - 1),
    run: ({ store }) => store.getState().nextPage(),
  },
  'view.fullscreen': {
    id: 'view.fullscreen', label: 'Full screen', shortcut: 'Ctrl+F11',
    run: ({ toggleFullScreen, notify }) =>
      toggleFullScreen ? toggleFullScreen() : notify('Fullscreen unavailable.'),
  },
  'view.tree': {
    id: 'view.tree', label: 'Document tree',
    checked: (s) => s.panels.tree,
    run: ({ store }) => store.getState().togglePanel('tree'),
  },
  'view.inspector': {
    id: 'view.inspector', label: 'Properties',
    checked: (s) => s.panels.inspector,
    run: ({ store }) => store.getState().togglePanel('inspector'),
  },
  'view.datasets': {
    id: 'view.datasets', label: 'Datasets',
    checked: (s) => s.panels.datasets,
    run: ({ store }) => store.getState().togglePanel('datasets'),
  },

  // ---- Data -----------------------------------------------------------
  'data.import': {
    id: 'data.import', label: 'Import…', shortcut: 'Ctrl+I',
    run: ({ openDialog }) => openDialog('importCsv'),
  },
  'data.edit': {
    id: 'data.edit', label: 'Editor…', shortcut: 'Ctrl+E',
    run: ({ openDialog }) => openDialog('dataEdit'),
  },
  'data.reload': {
    id: 'data.reload', label: 'Reload', shortcut: 'F5',
    run: ({ store }) => { void store.getState().reloadFile(); },
  },
  'data.create': {
    id: 'data.create', label: 'Create…',
    run: ({ openDialog }) => openDialog('dataCreate'),
  },
  'data.create2d': {
    id: 'data.create2d', label: 'Create 2D…',
    run: ({ openDialog }) => openDialog('dataCreate2d'),
  },
  'data.filter': {
    id: 'data.filter', label: 'Filter…',
    run: ({ openDialog }) => openDialog('filter'),
  },
  'data.histogram': {
    id: 'data.histogram', label: 'Histogram…',
    run: ({ openDialog }) => openDialog('histogram'),
  },
  'tools.console': {
    id: 'tools.console', label: 'Python console…',
    run: ({ openDialog }) => openDialog('console'),
  },

  // ---- Help -----------------------------------------------------------
  'help.about': {
    id: 'help.about', label: 'About Veusz',
    run: ({ openDialog }) => openDialog('about'),
  },
  'help.home': {
    id: 'help.home', label: 'Veusz home page',
    run: ({ openUrl, notify }) =>
      openUrl ? openUrl('https://veusz.github.io/') : notify('Cannot open links here.'),
  },

  ...insertActions(),
};
