/**
 * Right-click menu for a file-group header in the dataset panel,
 * ported from datasetbrowser.py:showContextMenu (filename node branch):
 *   Reload
 *   Unlink all
 *   Delete all
 */

import { type ReactNode } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { DocState } from '../../state/doc';

export interface DatasetFileContextMenuProps {
  store: UseBoundStore<StoreApi<DocState>>;
  filename: string;
  children: ReactNode;
}

const itemStyle: React.CSSProperties = {
  padding: '4px 24px 4px 12px', fontSize: 13, cursor: 'default',
  outline: 'none', userSelect: 'none',
};
const contentStyle: React.CSSProperties = {
  minWidth: 160, background: 'white', border: '1px solid #ccc',
  borderRadius: 4, padding: 4, boxShadow: '0 2px 10px rgba(0,0,0,0.15)', zIndex: 1000,
};

export function DatasetFileContextMenu({
  store, filename, children,
}: DatasetFileContextMenuProps) {
  const act = store.getState();
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content style={contentStyle} data-testid="dataset-file-context-menu">
          <ContextMenu.Item
            style={itemStyle}
            data-testid="dsfile-reload"
            onSelect={() => void act.reloadFile(filename)}
          >
            Reload
          </ContextMenu.Item>
          <ContextMenu.Item
            style={itemStyle}
            data-testid="dsfile-unlink-all"
            onSelect={() => void act.unlinkAllInFile(filename)}
          >
            Unlink all
          </ContextMenu.Item>
          <ContextMenu.Item
            style={itemStyle}
            data-testid="dsfile-delete-all"
            onSelect={() => void act.deleteAllInFile(filename)}
          >
            Delete all
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
