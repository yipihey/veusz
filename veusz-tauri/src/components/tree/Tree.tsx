import type React from 'react';
import type { WidgetTreeNode } from '../../rpc/types';

/**
 * How a click modifies the selection. Mirrors the conventional
 * desktop multi-select gesture (and the Qt widget tree):
 *  - 'replace' (plain click): selection becomes just this row
 *  - 'toggle'  (Ctrl/Cmd-click): add/remove this row
 *  - 'range'   (Shift-click): extend from the anchor to this row
 */
export type SelectMode = 'replace' | 'toggle' | 'range';

/**
 * Widget tree sidebar. Data is whatever `doc.tree` returns; the
 * component is purely presentational so vitest tests don't need the
 * daemon. Clicking a node emits its path + the gesture mode; the
 * parent computes the new selection set and re-renders the Inspector.
 */
export interface TreeProps {
  root: WidgetTreeNode;
  /** Currently selected paths (multi-select). */
  selected: string[];
  onSelect: (path: string, mode: SelectMode) => void;
  /** Right-click handler: opens the context menu for `path`. The
   *  parent first ensures `path` is part of the selection. */
  onContextMenu?: (path: string, e: React.MouseEvent) => void;
  /** Path currently in inline-rename mode, if any. */
  renamingPath?: string | null;
  /** Commit an inline rename (Enter); null cancels (Esc/blur). */
  onRenameCommit?: (path: string, newName: string | null) => void;
  /** Paths flagged as "cut" — rendered dimmed. */
  cutPaths?: string[];
}

export function Tree({
  root,
  selected,
  onSelect,
  onContextMenu,
  renamingPath,
  onRenameCommit,
  cutPaths,
}: TreeProps) {
  const selectedSet = new Set(selected);
  const cutSet = new Set(cutPaths ?? []);
  return (
    <ul data-testid="tree" role="tree">
      <TreeNode
        node={root}
        selectedSet={selectedSet}
        cutSet={cutSet}
        onSelect={onSelect}
        onContextMenu={onContextMenu}
        renamingPath={renamingPath ?? null}
        onRenameCommit={onRenameCommit}
      />
    </ul>
  );
}

function selectModeFromEvent(e: React.MouseEvent): SelectMode {
  if (e.shiftKey) return 'range';
  if (e.ctrlKey || e.metaKey) return 'toggle';
  return 'replace';
}

function TreeNode({
  node,
  selectedSet,
  cutSet,
  onSelect,
  onContextMenu,
  renamingPath,
  onRenameCommit,
}: {
  node: WidgetTreeNode;
  selectedSet: Set<string>;
  cutSet: Set<string>;
  onSelect: (path: string, mode: SelectMode) => void;
  onContextMenu?: (path: string, e: React.MouseEvent) => void;
  renamingPath: string | null;
  onRenameCommit?: (path: string, newName: string | null) => void;
}) {
  const isSelected = selectedSet.has(node.path);
  const isCut = cutSet.has(node.path);
  const isRenaming = renamingPath === node.path;
  return (
    <li role="treeitem" aria-selected={isSelected}>
      {isRenaming ? (
        <RenameInput
          initial={node.name}
          onCommit={(name) => onRenameCommit?.(node.path, name)}
        />
      ) : (
        <button
          type="button"
          data-testid={`tree-node-${node.path}`}
          data-selected={isSelected || undefined}
          data-cut={isCut || undefined}
          style={isCut ? { opacity: 0.5 } : undefined}
          onClick={(e) => onSelect(node.path, selectModeFromEvent(e))}
          // Note: do NOT preventDefault here — the Radix ContextMenu
          // trigger wrapping the tree needs the native contextmenu
          // event to open. We only record which row was targeted.
          onContextMenu={(e) => onContextMenu?.(node.path, e)}
        >
          <span data-testid={`tree-type-${node.path}`}>[{node.type}]</span>{' '}
          <span data-testid={`tree-name-${node.path}`}>{node.name || '/'}</span>
        </button>
      )}
      {node.children.length > 0 && (
        <ul role="group">
          {node.children.map((c) => (
            <TreeNode
              key={c.path}
              node={c}
              selectedSet={selectedSet}
              cutSet={cutSet}
              onSelect={onSelect}
              onContextMenu={onContextMenu}
              renamingPath={renamingPath}
              onRenameCommit={onRenameCommit}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function RenameInput({
  initial,
  onCommit,
}: {
  initial: string;
  onCommit: (name: string | null) => void;
}) {
  return (
    <input
      data-testid="tree-rename-input"
      autoFocus
      defaultValue={initial}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onCommit((e.target as HTMLInputElement).value.trim() || null);
        } else if (e.key === 'Escape') {
          onCommit(null);
        }
      }}
      onBlur={(e) => onCommit(e.target.value.trim() || null)}
    />
  );
}
