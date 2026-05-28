/**
 * Plot-canvas right-click menu, ported from
 * `PlotWindow.contextMenuEvent` (plotwindow.py:1130).
 *
 * Unlike the tree menu, this is generic — it never targets a specific
 * widget. Items:
 *   Zoom ▸     In / Out / 1:1 / Width / Height / Page
 *   Previous page / Next page
 *   Force update
 *   Full screen
 *   Updates ▸  Disable / On change / 0.1–10 s  (radio)
 *   Antialias  (checkbox)
 *
 * Zoom is handled by the canvas itself (it owns pan/zoom state) via
 * the `zoom` callbacks; page nav / antialias / update-policy / force
 * go through the store; full screen is delegated to the host.
 */

import { type ReactNode } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { DocState } from '../../state/doc';

export interface ZoomCommands {
  zoomIn: () => void;
  zoomOut: () => void;
  zoom11: () => void;
  zoomWidth: () => void;
  zoomHeight: () => void;
  zoomPage: () => void;
}

export interface PlotContextMenuProps {
  store: UseBoundStore<StoreApi<DocState>>;
  zoom: ZoomCommands;
  /** Toggle native/HTML full screen. */
  onToggleFullScreen?: () => void;
  /** Force-render dimensions. */
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
  minWidth: 190,
  background: 'white',
  border: '1px solid #ccc',
  borderRadius: 4,
  padding: 4,
  boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
  zIndex: 1000,
};
const sepStyle: React.CSSProperties = { height: 1, background: '#eee', margin: 4 };

const UPDATE_POLICIES: Array<{ value: string; label: string }> = [
  { value: 'disable', label: 'Disable' },
  { value: 'change', label: 'On document change' },
  { value: '0.1', label: 'Every 0.1 s' },
  { value: '0.5', label: 'Every 0.5 s' },
  { value: '1', label: 'Every 1 s' },
  { value: '2', label: 'Every 2 s' },
  { value: '5', label: 'Every 5 s' },
  { value: '10', label: 'Every 10 s' },
];

export function PlotContextMenu({
  store,
  zoom,
  onToggleFullScreen,
  renderWidth,
  renderHeight,
  children,
}: PlotContextMenuProps) {
  const currentPage = store((s) => s.currentPage);
  const pageCount = store((s) => s.tree?.children.length ?? 0);
  const antialias = store((s) => s.antialias);
  const updatePolicy = store((s) => s.updatePolicy);
  const act = store.getState();

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content style={contentStyle} data-testid="plot-context-menu">
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger style={itemStyle} data-testid="plot-ctx-zoom">
              Zoom ▸
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent style={contentStyle}>
                <ContextMenu.Item style={itemStyle} data-testid="plot-ctx-zoom-in"
                  onSelect={zoom.zoomIn}>Zoom in</ContextMenu.Item>
                <ContextMenu.Item style={itemStyle} data-testid="plot-ctx-zoom-out"
                  onSelect={zoom.zoomOut}>Zoom out</ContextMenu.Item>
                <ContextMenu.Item style={itemStyle} data-testid="plot-ctx-zoom-11"
                  onSelect={zoom.zoom11}>Zoom 1:1</ContextMenu.Item>
                <ContextMenu.Item style={itemStyle} data-testid="plot-ctx-zoom-width"
                  onSelect={zoom.zoomWidth}>Zoom to width</ContextMenu.Item>
                <ContextMenu.Item style={itemStyle} data-testid="plot-ctx-zoom-height"
                  onSelect={zoom.zoomHeight}>Zoom to height</ContextMenu.Item>
                <ContextMenu.Item style={itemStyle} data-testid="plot-ctx-zoom-page"
                  onSelect={zoom.zoomPage}>Zoom to page</ContextMenu.Item>
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>

          <ContextMenu.Separator style={sepStyle} />

          <ContextMenu.Item
            style={itemStyle}
            data-testid="plot-ctx-prev-page"
            disabled={currentPage <= 0}
            onSelect={() => act.prevPage()}
          >
            Previous page
          </ContextMenu.Item>
          <ContextMenu.Item
            style={itemStyle}
            data-testid="plot-ctx-next-page"
            disabled={currentPage >= pageCount - 1}
            onSelect={() => act.nextPage()}
          >
            Next page
          </ContextMenu.Item>
          <ContextMenu.Item
            style={itemStyle}
            data-testid="plot-ctx-force-update"
            onSelect={() => void act.forceRender(renderWidth, renderHeight)}
          >
            Force update
          </ContextMenu.Item>
          {onToggleFullScreen && (
            <ContextMenu.Item
              style={itemStyle}
              data-testid="plot-ctx-fullscreen"
              onSelect={onToggleFullScreen}
            >
              Full screen
            </ContextMenu.Item>
          )}

          <ContextMenu.Separator style={sepStyle} />

          <ContextMenu.Sub>
            <ContextMenu.SubTrigger style={itemStyle} data-testid="plot-ctx-updates">
              Updates ▸
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent style={contentStyle}>
                <ContextMenu.RadioGroup
                  value={updatePolicy}
                  onValueChange={(v) => void act.setUpdatePolicy(v)}
                >
                  {UPDATE_POLICIES.map((p) => (
                    <ContextMenu.RadioItem
                      key={p.value}
                      value={p.value}
                      style={itemStyle}
                      data-testid={`plot-ctx-update-${p.value}`}
                    >
                      <ContextMenu.ItemIndicator>● </ContextMenu.ItemIndicator>
                      {p.label}
                    </ContextMenu.RadioItem>
                  ))}
                </ContextMenu.RadioGroup>
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>

          <ContextMenu.CheckboxItem
            style={itemStyle}
            data-testid="plot-ctx-antialias"
            checked={antialias}
            onCheckedChange={(c) => void act.setAntialias(Boolean(c))}
          >
            <ContextMenu.ItemIndicator>✓ </ContextMenu.ItemIndicator>
            Antialias
          </ContextMenu.CheckboxItem>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
