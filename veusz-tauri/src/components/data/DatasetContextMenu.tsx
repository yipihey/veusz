/**
 * Right-click menu for a dataset row, ported from
 * datasetbrowser.py:showContextMenu (dataset node branch).
 *
 * Items:
 *   Edit data        (stub toast in v1 — no tabular editor yet)
 *   Delete
 *   Unlink file      (only when ≥1 selected dataset is file-linked)
 *   Unlink relation
 *   Tags ▸           existing tags (toggle) + "Add…"
 *   Copy
 *   Use as ▸         settable widget paths (single-select only)
 *   Paste
 *
 * Acts on the dataset-panel selection; the host ensures the
 * right-clicked row is part of the selection first.
 */

import { useState, type ReactNode } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { DocState } from '../../state/doc';

export interface DatasetContextMenuProps {
  store: UseBoundStore<StoreApi<DocState>>;
  /** The dataset row that was right-clicked. */
  targetName: string;
  /** Surface a transient message (e.g. the Edit-data stub). */
  onNotify?: (message: string) => void;
  /** Fired when the menu opens — host auto-selects the target row. */
  onOpen?: () => void;
  children: ReactNode;
}

const itemStyle: React.CSSProperties = {
  padding: '4px 24px 4px 12px', fontSize: 13, cursor: 'default',
  outline: 'none', userSelect: 'none',
};
const contentStyle: React.CSSProperties = {
  minWidth: 190, background: 'white', border: '1px solid #ccc',
  borderRadius: 4, padding: 4, boxShadow: '0 2px 10px rgba(0,0,0,0.15)', zIndex: 1000,
};
const sep: React.CSSProperties = { height: 1, background: '#eee', margin: 4 };

export function DatasetContextMenu({
  store, targetName, onNotify, onOpen, children,
}: DatasetContextMenuProps) {
  const datasets = store((s) => s.datasets);
  const selected = store((s) => s.selectedDatasets);
  const act = store.getState();

  // Selection the menu acts on (host ensures target is included).
  const acting = selected.includes(targetName) ? selected : [targetName];
  const single = acting.length === 1 ? acting[0] : null;

  const infoByName = new Map(datasets.map((d) => [d.name, d]));
  const anyLinked = acting.some((n) => infoByName.get(n)?.linked);

  // All tags currently in use, for the Tags submenu.
  const allTags = Array.from(
    new Set(datasets.flatMap((d) => d.tags ?? [])),
  ).sort();
  // Tags present on every dataset in the selection (checked state).
  const commonTags = new Set(
    allTags.filter((t) => acting.every((n) => (infoByName.get(n)?.tags ?? []).includes(t))),
  );

  const [useAsTargets, setUseAsTargets] = useState<
    Array<{ path: string; typename: string; widget: string }> | null
  >(null);

  const loadUseAs = () => {
    if (!single) return;
    void act.rpc.data.useAsTargets(single)
      .then((r) => setUseAsTargets(r.targets))
      .catch(() => setUseAsTargets([]));
  };

  return (
    <ContextMenu.Root onOpenChange={(o) => o && onOpen?.()}>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content style={contentStyle} data-testid="dataset-context-menu">
          <ContextMenu.Item
            style={itemStyle}
            data-testid="ds-edit-data"
            onSelect={() => onNotify?.('Tabular data editor not yet implemented')}
          >
            Edit data…
          </ContextMenu.Item>
          <ContextMenu.Item
            style={itemStyle}
            data-testid="ds-delete"
            onSelect={() => void act.deleteDatasets(acting)}
          >
            Delete
          </ContextMenu.Item>
          {anyLinked && (
            <ContextMenu.Item
              style={itemStyle}
              data-testid="ds-unlink-file"
              onSelect={() => void act.unlinkDatasetFile(acting)}
            >
              Unlink file
            </ContextMenu.Item>
          )}
          <ContextMenu.Item
            style={itemStyle}
            data-testid="ds-unlink-relation"
            onSelect={() => void act.unlinkDatasetRelation(acting)}
          >
            Unlink relation
          </ContextMenu.Item>

          <ContextMenu.Separator style={sep} />

          <ContextMenu.Sub>
            <ContextMenu.SubTrigger style={itemStyle} data-testid="ds-tags">
              Tags ▸
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent style={contentStyle}>
                {allTags.map((t) => (
                  <ContextMenu.CheckboxItem
                    key={t}
                    style={itemStyle}
                    data-testid={`ds-tag-${t}`}
                    checked={commonTags.has(t)}
                    onCheckedChange={(c) =>
                      c ? void act.tagDatasets(acting, t)
                        : void act.untagDatasets(acting, t)}
                  >
                    <ContextMenu.ItemIndicator>✓ </ContextMenu.ItemIndicator>
                    {t}
                  </ContextMenu.CheckboxItem>
                ))}
                {allTags.length > 0 && <ContextMenu.Separator style={sep} />}
                <ContextMenu.Item
                  style={itemStyle}
                  data-testid="ds-tag-add"
                  onSelect={() => {
                    const t = window.prompt('New tag:');
                    if (t) void act.tagDatasets(acting, t);
                  }}
                >
                  Add…
                </ContextMenu.Item>
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>

          <ContextMenu.Item
            style={itemStyle}
            data-testid="ds-copy"
            onSelect={() => void act.copyDatasets(acting)}
          >
            Copy
          </ContextMenu.Item>

          {single && (
            <ContextMenu.Sub onOpenChange={(o) => o && loadUseAs()}>
              <ContextMenu.SubTrigger style={itemStyle} data-testid="ds-use-as">
                Use as ▸
              </ContextMenu.SubTrigger>
              <ContextMenu.Portal>
                <ContextMenu.SubContent style={contentStyle}>
                  {useAsTargets === null ? (
                    <ContextMenu.Item style={itemStyle} disabled>Loading…</ContextMenu.Item>
                  ) : useAsTargets.length === 0 ? (
                    <ContextMenu.Item style={itemStyle} disabled>No targets</ContextMenu.Item>
                  ) : (
                    useAsTargets.map((t) => (
                      <ContextMenu.Item
                        key={t.path}
                        style={itemStyle}
                        data-testid={`ds-use-as-${t.path}`}
                        onSelect={() =>
                          void act.setValue(t.path, single)}
                      >
                        {t.path}
                      </ContextMenu.Item>
                    ))
                  )}
                </ContextMenu.SubContent>
              </ContextMenu.Portal>
            </ContextMenu.Sub>
          )}

          <ContextMenu.Item
            style={itemStyle}
            data-testid="ds-paste"
            onSelect={() => void act.pasteDatasets()}
          >
            Paste
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
