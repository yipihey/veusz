/**
 * Right-click context menu for the widget tree, ported from
 * `WidgetTreeView.contextmenu` in treeeditwindow.py.
 *
 * Wraps the tree in a Radix ContextMenu. The host records which row
 * was right-clicked (`targetPath`) and ensures it's part of the
 * selection before the menu opens; the menu's actions then operate on
 * the whole current selection (so multi-select Cut/Copy/Delete work).
 *
 * Items (Qt parity):
 *   Select ▸        — type/name/sibling/page selectors
 *   Cut / Copy / Copy as Image
 *   Paste
 *   Move up / Move down
 *   Delete
 *   Rename
 *   Show / Hide
 */

import { useState, type ReactNode } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { DocState } from '../../state/doc';
import { buildSelectOptions } from './treeselect';

export interface TreeContextMenuProps {
  store: UseBoundStore<StoreApi<DocState>>;
  /** The row that was last right-clicked (menu target). */
  targetPath: string | null;
  /** Begin inline rename of `path` (host flips the row to an input). */
  onStartRename: (path: string) => void;
  /** Render dimensions for "Copy as Image". */
  renderWidth: number;
  renderHeight: number;
  children: ReactNode;
}

const itemStyle: React.CSSProperties = {
  padding: '4px 24px 4px 12px',
  fontSize: 13,
  cursor: 'default',
  outline: 'none',
  userSelect: 'none',
};
const contentStyle: React.CSSProperties = {
  minWidth: 200,
  background: 'white',
  border: '1px solid #ccc',
  borderRadius: 4,
  padding: 4,
  boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
  zIndex: 1000,
};

export function TreeContextMenu({
  store,
  targetPath,
  onStartRename,
  renderWidth,
  renderHeight,
  children,
}: TreeContextMenuProps) {
  const tree = store((s) => s.tree);
  const selected = store((s) => s.selected);

  // The selection the menu acts on. Right-click should have already
  // ensured targetPath is selected (host responsibility); fall back to
  // [targetPath] defensively.
  const acting =
    targetPath && selected.includes(targetPath)
      ? selected
      : targetPath
        ? [targetPath]
        : selected;

  const isRoot = acting.includes('/');
  const single = acting.length === 1 ? acting[0] : null;
  const selectOptions = single ? buildSelectOptions(tree, single) : [];

  const act = store.getState();

  // Paste is enabled only when the clipboard actually holds a widget
  // payload pastable under the target. Checked when the menu opens
  // (async — NSPasteboard read), so it defaults disabled and flips on.
  const [canPaste, setCanPaste] = useState(false);
  const refreshCanPaste = () => {
    if (!single) {
      setCanPaste(false);
      return;
    }
    void act.canPasteWidgets(single).then(setCanPaste);
  };

  return (
    <ContextMenu.Root onOpenChange={(open) => open && refreshCanPaste()}>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content style={contentStyle} data-testid="tree-context-menu">
          {single && selectOptions.length > 0 && (
            <ContextMenu.Sub>
              <ContextMenu.SubTrigger style={itemStyle} data-testid="ctx-select">
                Select ▸
              </ContextMenu.SubTrigger>
              <ContextMenu.Portal>
                <ContextMenu.SubContent style={contentStyle}>
                  {selectOptions.map((opt, i) => (
                    <ContextMenu.Item
                      key={i}
                      style={itemStyle}
                      data-testid={`ctx-select-${i}`}
                      onSelect={() => void act.select(opt.paths)}
                    >
                      {opt.label}
                    </ContextMenu.Item>
                  ))}
                </ContextMenu.SubContent>
              </ContextMenu.Portal>
            </ContextMenu.Sub>
          )}

          <ContextMenu.Separator style={{ height: 1, background: '#eee', margin: 4 }} />

          <ContextMenu.Item
            style={itemStyle}
            data-testid="ctx-cut"
            disabled={isRoot}
            onSelect={() => void act.cutWidgets(acting)}
          >
            Cut
          </ContextMenu.Item>
          <ContextMenu.Item
            style={itemStyle}
            data-testid="ctx-copy"
            disabled={isRoot}
            onSelect={() => void act.copyWidgets(acting)}
          >
            Copy
          </ContextMenu.Item>
          <ContextMenu.Item
            style={itemStyle}
            data-testid="ctx-copy-image"
            disabled={isRoot}
            onSelect={() => void act.copyWidgetAsImage(0, renderWidth, renderHeight)}
          >
            Copy as Image
          </ContextMenu.Item>
          <ContextMenu.Item
            style={itemStyle}
            data-testid="ctx-paste"
            disabled={!single || !canPaste}
            onSelect={() => single && void act.pasteWidgets(single)}
          >
            Paste
          </ContextMenu.Item>

          <ContextMenu.Separator style={{ height: 1, background: '#eee', margin: 4 }} />

          <ContextMenu.Item
            style={itemStyle}
            data-testid="ctx-move-up"
            disabled={isRoot || !single}
            onSelect={() => single && void act.moveWidget(single, 'up')}
          >
            Move up
          </ContextMenu.Item>
          <ContextMenu.Item
            style={itemStyle}
            data-testid="ctx-move-down"
            disabled={isRoot || !single}
            onSelect={() => single && void act.moveWidget(single, 'down')}
          >
            Move down
          </ContextMenu.Item>
          <ContextMenu.Item
            style={itemStyle}
            data-testid="ctx-delete"
            disabled={isRoot}
            onSelect={() => {
              for (const p of acting) void act.removeWidget(p);
            }}
          >
            Delete
          </ContextMenu.Item>
          <ContextMenu.Item
            style={itemStyle}
            data-testid="ctx-rename"
            disabled={isRoot || !single}
            onSelect={() => single && onStartRename(single)}
          >
            Rename
          </ContextMenu.Item>

          <ContextMenu.Separator style={{ height: 1, background: '#eee', margin: 4 }} />

          <ContextMenu.Item
            style={itemStyle}
            data-testid="ctx-show"
            onSelect={() => void act.setHidden(acting, false)}
          >
            Show
          </ContextMenu.Item>
          <ContextMenu.Item
            style={itemStyle}
            data-testid="ctx-hide"
            onSelect={() => void act.setHidden(acting, true)}
          >
            Hide
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
