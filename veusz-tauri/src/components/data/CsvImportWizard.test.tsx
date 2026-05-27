import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { CsvImportWizard } from './CsvImportWizard';
import { createRpc } from '../../rpc/client';
import { mockTransport } from '../../rpc/transport';

function makeRpc(overrides: Record<string, (p: Record<string, unknown>) => unknown> = {}) {
  return createRpc(mockTransport({
    'data.preview_csv': () => ({
      header: ['x', 'y'],
      rows: [['0', '0'], ['1', '1'], ['2', '4']],
      total_lines_estimated: 4,
      truncated: false,
    }),
    'data.import': () => ({ imported: ['x', 'y'], errors: [] }),
    ...overrides,
  }));
}

describe('CsvImportWizard', () => {
  it('shows the filename and renders the preview table', async () => {
    render(
      <CsvImportWizard
        rpc={makeRpc()}
        filename="/tmp/data.csv"
        onImported={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.getByTestId('csv-wizard-filename')).toHaveTextContent('/tmp/data.csv');
    await waitFor(() => screen.getByTestId('csv-preview-table'));
    expect(within(screen.getByTestId('csv-preview-table')).getAllByRole('columnheader'))
      .toHaveLength(2);
    expect(screen.getByTestId('csv-row-0')).toHaveTextContent('0');
    expect(screen.getByTestId('csv-row-2')).toHaveTextContent('4');
  });

  it('re-fetches the preview when delimiter changes', async () => {
    const seen: Array<Record<string, unknown>> = [];
    const rpc = createRpc(mockTransport({
      'data.preview_csv': (params) => {
        seen.push(params);
        return { header: [], rows: [], total_lines_estimated: 0, truncated: false };
      },
    }));
    render(
      <CsvImportWizard rpc={rpc} filename="/tmp/a.csv"
        onImported={() => {}} onCancel={() => {}} />,
    );
    await waitFor(() => expect(seen.length).toBeGreaterThanOrEqual(1));
    const beforeCount = seen.length;
    fireEvent.change(screen.getByTestId('csv-delimiter'), { target: { value: '\t' } });
    await waitFor(() => expect(seen.length).toBeGreaterThan(beforeCount));
    expect(seen[seen.length - 1].delimiter).toBe('\t');
  });

  it('custom delimiter input appears and is used in the preview', async () => {
    const seen: Array<Record<string, unknown>> = [];
    const rpc = createRpc(mockTransport({
      'data.preview_csv': (params) => {
        seen.push(params);
        return { header: [], rows: [], total_lines_estimated: 0, truncated: false };
      },
    }));
    render(<CsvImportWizard rpc={rpc} filename="/tmp/a.csv"
      onImported={() => {}} onCancel={() => {}} />);
    await waitFor(() => expect(seen.length).toBeGreaterThanOrEqual(1));
    fireEvent.change(screen.getByTestId('csv-delimiter'), { target: { value: 'custom' } });
    fireEvent.change(screen.getByTestId('csv-delimiter-custom'), { target: { value: '|' } });
    await waitFor(() => {
      expect(seen[seen.length - 1].delimiter).toBe('|');
    });
  });

  it('surfaces preview RPC errors', async () => {
    const rpc = createRpc(mockTransport({
      'data.preview_csv': () => { throw new Error('boom'); },
    }));
    render(<CsvImportWizard rpc={rpc} filename="/tmp/a.csv"
      onImported={() => {}} onCancel={() => {}} />);
    await waitFor(() => screen.getByTestId('csv-preview-error'));
    expect(screen.getByTestId('csv-preview-error')).toHaveTextContent('boom');
  });

  it('Import button calls data.import with the right options and onImported', async () => {
    const onImported = vi.fn();
    const imports: Array<Record<string, unknown>> = [];
    const rpc = createRpc(mockTransport({
      'data.preview_csv': () => ({
        header: ['x'], rows: [['1']], total_lines_estimated: 1, truncated: false,
      }),
      'data.import': (params) => {
        imports.push(params);
        return { imported: ['x'], errors: [] };
      },
    }));
    render(
      <CsvImportWizard rpc={rpc} filename="/tmp/a.csv"
        onImported={onImported} onCancel={() => {}} />,
    );
    await waitFor(() => screen.getByTestId('csv-preview-table'));
    fireEvent.change(screen.getByTestId('csv-rows-ignore'), { target: { value: '2' } });
    fireEvent.change(screen.getByTestId('csv-prefix'), { target: { value: 'a_' } });
    await waitFor(() => screen.getByTestId('csv-preview-table'));
    fireEvent.click(screen.getByTestId('csv-import'));
    await waitFor(() => expect(onImported).toHaveBeenCalledWith(['x']));
    const opts = imports[0].options as Record<string, unknown>;
    expect(opts.rowsignore).toBe(2);
    expect(opts.dsprefix).toBe('a_');
    expect(opts.delimiter).toBe(',');
  });

  it('Cancel button calls onCancel', async () => {
    const onCancel = vi.fn();
    render(<CsvImportWizard rpc={makeRpc()} filename="/tmp/a.csv"
      onImported={() => {}} onCancel={onCancel} />);
    await waitFor(() => screen.getByTestId('csv-preview-table'));
    fireEvent.click(screen.getByTestId('csv-cancel'));
    expect(onCancel).toHaveBeenCalled();
  });
});
