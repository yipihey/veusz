import type { WidgetTreeNode } from '../../rpc/types';

/**
 * Widget tree sidebar. Data is whatever `doc.tree` returns; the
 * component is purely presentational so vitest tests don't need the
 * daemon. Clicking a node emits its path; the parent stores the
 * selection and re-renders the Inspector.
 */
export interface TreeProps {
  root: WidgetTreeNode;
  selected?: string;
  onSelect: (path: string) => void;
}

export function Tree({ root, selected, onSelect }: TreeProps) {
  return (
    <ul data-testid="tree" role="tree">
      <TreeNode node={root} selected={selected} onSelect={onSelect} />
    </ul>
  );
}

function TreeNode({
  node,
  selected,
  onSelect,
}: {
  node: WidgetTreeNode;
  selected?: string;
  onSelect: (path: string) => void;
}) {
  const isSelected = node.path === selected;
  return (
    <li role="treeitem" aria-selected={isSelected}>
      <button
        type="button"
        data-testid={`tree-node-${node.path}`}
        data-selected={isSelected || undefined}
        onClick={() => onSelect(node.path)}
      >
        <span data-testid={`tree-type-${node.path}`}>[{node.type}]</span>{' '}
        <span data-testid={`tree-name-${node.path}`}>{node.name || '/'}</span>
      </button>
      {node.children.length > 0 && (
        <ul role="group">
          {node.children.map((c) => (
            <TreeNode key={c.path} node={c} selected={selected} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </li>
  );
}
