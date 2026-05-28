import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DatasetPanel } from './DatasetPanel';

describe('DatasetPanel', () => {
  it('shows empty state when there are no datasets', () => {
    render(<DatasetPanel datasets={[]} onSelect={() => {}} />);
    expect(screen.getByTestId('dataset-empty')).toBeInTheDocument();
  });

  it('renders rows for each dataset', () => {
    render(
      <DatasetPanel
        datasets={[
          { name: 'x', type: 'Dataset', len: 10, shape: [10] },
          { name: 'y', type: 'Dataset', len: 10, shape: [10] },
        ]}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByTestId('dataset-row-x')).toBeInTheDocument();
    expect(screen.getByTestId('dataset-row-y')).toBeInTheDocument();
  });

  it('emits onSelect when a row is clicked', () => {
    const onSelect = vi.fn();
    render(
      <DatasetPanel
        datasets={[{ name: 'x', type: 'Dataset', len: 10 }]}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByTestId('dataset-row-x'));
    expect(onSelect).toHaveBeenCalledWith('x', 'replace');
  });

  it('marks every dataset in a multi-selection', () => {
    render(
      <DatasetPanel
        datasets={[
          { name: 'x', type: 'Dataset', len: 10 },
          { name: 'y', type: 'Dataset', len: 10 },
        ]}
        selected={['x', 'y']}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByTestId('dataset-row-x').dataset.selected).toBe('true');
    expect(screen.getByTestId('dataset-row-y').dataset.selected).toBe('true');
  });

  it('emits toggle/range modes on modifier-click', () => {
    const onSelect = vi.fn();
    render(
      <DatasetPanel
        datasets={[
          { name: 'x', type: 'Dataset', len: 10 },
          { name: 'y', type: 'Dataset', len: 10 },
        ]}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByTestId('dataset-row-x'), { ctrlKey: true });
    expect(onSelect).toHaveBeenLastCalledWith('x', 'toggle');
    fireEvent.click(screen.getByTestId('dataset-row-y'), { shiftKey: true });
    expect(onSelect).toHaveBeenLastCalledWith('y', 'range');
  });

  it('groups file-linked datasets under a file header', () => {
    render(
      <DatasetPanel
        datasets={[
          { name: 'm', type: 'Dataset', len: 10 },
          { name: 'x', type: 'Dataset', len: 10, linked: '/data/in.csv' },
          { name: 'y', type: 'Dataset', len: 10, linked: '/data/in.csv' },
        ]}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByTestId('dataset-file-/data/in.csv')).toHaveTextContent('in.csv');
    // In-memory dataset 'm' and linked 'x'/'y' all render.
    expect(screen.getByTestId('dataset-row-m')).toBeInTheDocument();
    expect(screen.getByTestId('dataset-row-x')).toBeInTheDocument();
  });

  it('marks selected dataset', () => {
    render(
      <DatasetPanel
        datasets={[
          { name: 'x', type: 'Dataset', len: 10 },
          { name: 'y', type: 'Dataset', len: 10 },
        ]}
        selected={['y']}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByTestId('dataset-row-y').dataset.selected).toBe('true');
    expect(screen.getByTestId('dataset-row-x').dataset.selected).toBeUndefined();
  });

  it('renders stats panel when details supplied', () => {
    render(
      <DatasetPanel
        datasets={[{ name: 'x', type: 'Dataset', len: 100 }]}
        onSelect={() => {}}
        details={{
          name: 'x',
          stats: { min: 0, max: 99, mean: 49.5, std: 28.9, len: 100 },
          preview: [0, 1, 2, 3, 4],
        }}
      />,
    );
    expect(screen.getByTestId('dataset-details-x')).toBeInTheDocument();
    expect(screen.getByTestId('dataset-min')).toHaveTextContent('0');
    expect(screen.getByTestId('dataset-max')).toHaveTextContent('99');
    expect(screen.getByTestId('dataset-preview')).toHaveTextContent('0, 1.000, 2.000, 3.000, 4.000');
  });

  it('shows import button when onImport supplied', () => {
    const onImport = vi.fn();
    render(<DatasetPanel datasets={[]} onSelect={() => {}} onImport={onImport} />);
    fireEvent.click(screen.getByTestId('dataset-import'));
    expect(onImport).toHaveBeenCalled();
  });
});
