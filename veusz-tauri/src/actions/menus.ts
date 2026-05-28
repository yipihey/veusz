/**
 * Top menu bar definition — mirrors Qt's `menus` tree. References action ids
 * from actions.ts. The Insert menu is generated from INSERT_WIDGETS so it
 * stays in sync with the widget set.
 */

import type { Menu, MenuItem } from './types';
import { INSERT_WIDGETS } from './actions';

const a = (id: string): MenuItem => ({ kind: 'action', id });
const sep: MenuItem = { kind: 'separator' };

const insertMenu: MenuItem[] = INSERT_WIDGETS.map((g) => ({
  kind: 'submenu',
  label: g.group,
  items: g.items.map(([type]) => a(`add.${type}`)),
}));

export const MENUS: Menu[] = [
  {
    label: 'File',
    items: [
      a('file.new'), a('file.open'),
      { kind: 'submenu', label: 'Open Recent', items: [{ kind: 'recent' }] },
      sep,
      a('file.save'), a('file.saveas'), sep,
      a('file.export'), sep,
      a('file.close'),
    ],
  },
  {
    label: 'Edit',
    items: [
      a('edit.undo'), a('edit.redo'), sep,
      a('edit.cut'), a('edit.copy'), a('edit.paste'), a('edit.copyimage'),
      a('edit.delete'), sep,
      a('edit.moveup'), a('edit.movedown'), sep,
      a('edit.prefs'), a('edit.stylesheet'), a('edit.custom'),
    ],
  },
  {
    label: 'View',
    items: [
      a('view.tree'), a('view.inspector'), a('view.datasets'), sep,
      a('view.prevpage'), a('view.nextpage'), sep,
      a('view.fullscreen'),
    ],
  },
  {
    label: 'Insert',
    items: insertMenu,
  },
  {
    label: 'Data',
    items: [
      a('data.import'), a('data.importfile'), a('data.edit'), sep,
      a('data.create'), a('data.create2d'), a('data.filter'), a('data.histogram'),
      { kind: 'submenu', label: 'Operations', items: [{ kind: 'plugins', which: 'dataset' }] },
      sep,
      a('data.reload'),
    ],
  },
  {
    label: 'Tools',
    items: [
      a('tools.console'), sep,
      { kind: 'plugins', which: 'tools' },
    ],
  },
  {
    label: 'Help',
    items: [
      a('help.home'), sep,
      a('help.about'),
    ],
  },
];
