import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { FitDialog } from './FitDialog';
import { createRpc } from '../../rpc/client';
import { mockTransport } from '../../rpc/transport';

const DATASETS = [
  { name: 'x', type: 'Dataset', len: 10 },
  { name: 'y', type: 'Dataset', len: 10 },
];

function rpcWith(run: (p: Record<string, unknown>) => unknown) {
  return createRpc(mockTransport({
    'fit.run': run,
  }));
}

describe('FitDialog', () => {
  it('renders dataset pickers populated from props', () => {
    render(<FitDialog rpc={rpcWith(() => ({}))}
      datasets={DATASETS} onClose={() => {}} />);
    const xSel = screen.getByTestId('fit-xdata') as HTMLSelectElement;
    expect(xSel.options.length).toBe(2);
    expect(xSel.value).toBe('x');
  });

  it('seeds parameter rows from `initial.params`', () => {
    render(<FitDialog rpc={rpcWith(() => ({}))}
      datasets={DATASETS}
      initial={{ params: { a: 2, b: -1 } }}
      onClose={() => {}} />);
    expect(screen.getByTestId('fit-param-row-0')).toBeInTheDocument();
    expect((screen.getByTestId('fit-param-name-0') as HTMLInputElement).value).toBe('a');
    expect((screen.getByTestId('fit-param-name-1') as HTMLInputElement).value).toBe('b');
    expect((screen.getByTestId('fit-param-initial-1') as HTMLInputElement).value).toBe('-1');
  });

  it('adding a parameter row appends an empty row', () => {
    render(<FitDialog rpc={rpcWith(() => ({}))}
      datasets={DATASETS} onClose={() => {}} />);
    const before = screen.getAllByTestId(/^fit-param-row-/).length;
    fireEvent.click(screen.getByTestId('fit-param-add'));
    const after = screen.getAllByTestId(/^fit-param-row-/).length;
    expect(after).toBe(before + 1);
  });

  it('Run fit calls fit.run with the right payload and renders results', async () => {
    const calls: Array<Record<string, unknown>> = [];
    const rpc = rpcWith((p) => {
      calls.push(p);
      return {
        success: true,
        message: 'ok',
        params: {
          m: { value: 3.001, stderr: 0.01 },
          c: { value: 0.998, stderr: 0.02 },
        },
        chi2: 0.5, dof: 48, reduced_chi2: 0.0104,
        x_range: [0, 10],
      };
    });
    render(<FitDialog rpc={rpc} datasets={DATASETS} onClose={() => {}} />);
    fireEvent.click(screen.getByTestId('fit-run'));
    await waitFor(() => screen.getByTestId('fit-result'));
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      xData: 'x', yData: 'y', function: 'm*x + c',
      params: { m: 1, c: 0 },
    });
    expect(screen.getByTestId('fit-result-value-m')).toHaveTextContent('3.0010');
    expect(screen.getByTestId('fit-result-stderr-m')).toHaveTextContent('0.0100');
    expect(screen.getByTestId('fit-result-chi2')).toHaveTextContent('0.01040');
  });

  it('forwards the fit_range when restricted-range is enabled', async () => {
    const calls: Array<Record<string, unknown>> = [];
    const rpc = rpcWith((p) => {
      calls.push(p);
      return { success: true, message: 'ok', params: {},
               chi2: 0, dof: 1, reduced_chi2: 0 };
    });
    render(<FitDialog rpc={rpc} datasets={DATASETS} onClose={() => {}} />);
    fireEvent.click(screen.getByTestId('fit-range-enable'));
    fireEvent.change(screen.getByTestId('fit-range-lo'), { target: { value: '1.5' } });
    fireEvent.change(screen.getByTestId('fit-range-hi'), { target: { value: '8.0' } });
    fireEvent.click(screen.getByTestId('fit-run'));
    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].fit_range).toEqual([1.5, 8.0]);
  });

  it('shows fit failures with the daemon error message', async () => {
    const rpc = rpcWith(() => ({
      success: false,
      message: 'failed to converge',
      params: { m: { value: 1.0, stderr: null } },
      chi2: null, dof: null, reduced_chi2: null,
    }));
    render(<FitDialog rpc={rpc} datasets={DATASETS} onClose={() => {}} />);
    fireEvent.click(screen.getByTestId('fit-run'));
    await waitFor(() => screen.getByTestId('fit-result-message'));
    expect(screen.getByTestId('fit-result-message')).toHaveTextContent('failed to converge');
    expect(within(screen.getByTestId('fit-result-row-m'))
      .getByTestId('fit-result-stderr-m')).toHaveTextContent('—');
  });

  it('surfaces RPC errors (e.g. scipy missing)', async () => {
    const rpc = rpcWith(() => { throw new Error('scipy is required'); });
    render(<FitDialog rpc={rpc} datasets={DATASETS} onClose={() => {}} />);
    fireEvent.click(screen.getByTestId('fit-run'));
    await waitFor(() => screen.getByTestId('fit-error'));
    expect(screen.getByTestId('fit-error')).toHaveTextContent('scipy is required');
  });

  it('Close button calls onClose', () => {
    const onClose = vi.fn();
    render(<FitDialog rpc={rpcWith(() => ({}))}
      datasets={DATASETS} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('fit-cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
