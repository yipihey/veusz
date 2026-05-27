import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tree } from './Tree';
import type { WidgetTreeNode } from '../../rpc/types';

const sample: WidgetTreeNode = {
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
      ],
    },
  ],
};

describe('Tree', () => {
  it('renders the full hierarchy', () => {
    render(<Tree root={sample} onSelect={() => {}} />);
    for (const p of ['/', '/page1', '/page1/graph1', '/page1/graph1/x', '/page1/graph1/y', '/page1/graph1/xy1']) {
      expect(screen.getByTestId(`tree-node-${p}`)).toBeInTheDocument();
    }
  });

  it('marks the selected node', () => {
    render(<Tree root={sample} selected="/page1/graph1/xy1" onSelect={() => {}} />);
    expect(screen.getByTestId('tree-node-/page1/graph1/xy1').dataset.selected).toBe('true');
    expect(screen.getByTestId('tree-node-/page1/graph1/x').dataset.selected).toBeUndefined();
  });

  it('emits onSelect with the clicked path', () => {
    const onSelect = vi.fn();
    render(<Tree root={sample} onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId('tree-node-/page1/graph1/xy1'));
    expect(onSelect).toHaveBeenCalledWith('/page1/graph1/xy1');
  });

  it('shows widget type and name labels', () => {
    render(<Tree root={sample} onSelect={() => {}} />);
    expect(screen.getByTestId('tree-type-/page1/graph1/xy1')).toHaveTextContent('[xy]');
    expect(screen.getByTestId('tree-name-/page1/graph1/xy1')).toHaveTextContent('xy1');
  });
});
