/**
 * Toolbar groups — mirrors Qt's Main / Data / Insert / Edit / View toolbars.
 * Each group is a list of action ids; the renderer draws a button per id with
 * a separator between groups. The Insert toolbar carries the most-common
 * widgets (the full set lives in the Insert menu).
 */

import type { ToolbarGroup } from './types';

// File + Undo/Redo + backend selector live in AppShell's slim toolbar, so the
// registry toolbar carries the net-new groups the slim toolbar lacks: widget
// insertion, edit ops, data, and view/page navigation.
export const TOOLBARS: ToolbarGroup[] = [
  { id: 'insert', actions: [
    'add.page', 'add.graph', 'add.axis', 'add.xy', 'add.function',
    'add.bar', 'add.histo', 'add.image', 'add.contour', 'add.key', 'add.label',
  ]},
  { id: 'edit', actions: ['edit.cut', 'edit.copy', 'edit.paste', 'edit.delete'] },
  { id: 'data', actions: ['data.import', 'data.reload'] },
  { id: 'view', actions: ['view.prevpage', 'view.nextpage', 'view.fullscreen'] },
];
