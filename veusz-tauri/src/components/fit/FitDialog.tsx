import { useState } from 'react';
import type { Rpc } from '../../rpc/client';
import type { DataInfo } from '../../rpc/types';

/**
 * Fit dialog. Lets the user pick xData/yData, write a function
 * expression, declare fit parameters with initial values, and an
 * optional fit range. Calls `fit.run` and renders the resulting
 * best-fit parameters with uncertainties + reduced chi-squared.
 */

export interface FitDialogProps {
  rpc: Rpc;
  datasets: DataInfo[];
  /** Pre-populate xData / yData if a Fit widget or graph already
   *  has them set; the user can still override. */
  initial?: {
    xData?: string;
    yData?: string;
    function?: string;
    params?: Record<string, number>;
  };
  onClose: () => void;
}

interface ParamRow {
  name: string;
  initial: number;
}

export function FitDialog({ rpc, datasets, initial, onClose }: FitDialogProps) {
  const candidates = datasets.map((d) => d.name);
  const [xData, setXData] = useState(initial?.xData ?? candidates[0] ?? '');
  const [yData, setYData] = useState(initial?.yData ?? candidates[1] ?? '');
  const [func, setFunc] = useState(initial?.function ?? 'm*x + c');
  const [rows, setRows] = useState<ParamRow[]>(() =>
    Object.entries(initial?.params ?? { m: 1, c: 0 })
      .map(([name, initial]) => ({ name, initial })),
  );
  const [useRange, setUseRange] = useState(false);
  const [rangeLo, setRangeLo] = useState('0');
  const [rangeHi, setRangeHi] = useState('1');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<Rpc['fit']['run']>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const params: Record<string, number> = {};
      for (const r of rows) {
        if (!r.name) continue;
        params[r.name] = r.initial;
      }
      const r = await rpc.fit.run({
        xData, yData, function: func, params,
        fit_range: useRange
          ? [Number(rangeLo), Number(rangeHi)]
          : undefined,
      });
      setResult(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRunning(false);
    }
  };

  const updateRow = (i: number, patch: Partial<ParamRow>) => {
    setRows((rs) => rs.map((r, j) => (i === j ? { ...r, ...patch } : r)));
  };

  return (
    <div data-testid="fit-dialog" role="dialog" aria-label="Fit"
      style={{ padding: 16, background: '#fff', border: '1px solid #ccc',
               maxWidth: 600 }}>
      <h3>Fit function to data</h3>

      <label style={{ display: 'block', marginBottom: 8 }}>
        <span style={{ display: 'block', fontSize: 13, color: '#444' }}>x data</span>
        <select value={xData} data-testid="fit-xdata"
          onChange={(e) => setXData(e.target.value)}>
          {candidates.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>

      <label style={{ display: 'block', marginBottom: 8 }}>
        <span style={{ display: 'block', fontSize: 13, color: '#444' }}>y data</span>
        <select value={yData} data-testid="fit-ydata"
          onChange={(e) => setYData(e.target.value)}>
          {candidates.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>

      <label style={{ display: 'block', marginBottom: 8 }}>
        <span style={{ display: 'block', fontSize: 13, color: '#444' }}>
          Function (in <code>x</code> and parameters below)
        </span>
        <input type="text" value={func} data-testid="fit-function"
          onChange={(e) => setFunc(e.target.value)}
          style={{ width: '100%', fontFamily: 'monospace' }} />
      </label>

      <fieldset style={{ marginBottom: 8 }}>
        <legend>Parameters</legend>
        <table data-testid="fit-params-table">
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} data-testid={`fit-param-row-${i}`}>
                <td>
                  <input
                    type="text"
                    value={row.name}
                    data-testid={`fit-param-name-${i}`}
                    onChange={(e) => updateRow(i, { name: e.target.value })}
                    style={{ width: 80 }}
                  />
                </td>
                <td>=</td>
                <td>
                  <input
                    type="number"
                    value={row.initial}
                    data-testid={`fit-param-initial-${i}`}
                    onChange={(e) => updateRow(i, { initial: Number(e.target.value) })}
                  />
                </td>
                <td>
                  <button type="button"
                    data-testid={`fit-param-remove-${i}`}
                    onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
                  >−</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" data-testid="fit-param-add"
          onClick={() => setRows((rs) => [...rs, { name: '', initial: 0 }])}
        >Add parameter</button>
      </fieldset>

      <label style={{ display: 'block', marginBottom: 8 }}>
        <input type="checkbox" checked={useRange}
          data-testid="fit-range-enable"
          onChange={(e) => setUseRange(e.target.checked)} /> Restrict fit range
      </label>
      {useRange && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          <input type="number" value={rangeLo} data-testid="fit-range-lo"
            onChange={(e) => setRangeLo(e.target.value)} />
          <span>…</span>
          <input type="number" value={rangeHi} data-testid="fit-range-hi"
            onChange={(e) => setRangeHi(e.target.value)} />
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" data-testid="fit-cancel"
          onClick={onClose} disabled={running}>Close</button>
        <button type="button" data-testid="fit-run"
          onClick={() => void handleRun()} disabled={running}>
          {running ? 'Running…' : 'Run fit'}
        </button>
      </div>

      {error && (
        <p data-testid="fit-error" role="alert" style={{ color: 'crimson' }}>
          {error}
        </p>
      )}

      {result && (
        <section data-testid="fit-result" style={{ marginTop: 16 }}>
          <h4>{result.success ? 'Results' : 'Failed'}</h4>
          {!result.success && (
            <p data-testid="fit-result-message" style={{ color: 'crimson' }}>
              {result.message}
            </p>
          )}
          <table data-testid="fit-result-table">
            <thead>
              <tr><th>Parameter</th><th>Value</th><th>±</th></tr>
            </thead>
            <tbody>
              {Object.entries(result.params).map(([name, p]) => (
                <tr key={name} data-testid={`fit-result-row-${name}`}>
                  <td>{name}</td>
                  <td data-testid={`fit-result-value-${name}`}>
                    {p.value.toPrecision(6)}
                  </td>
                  <td data-testid={`fit-result-stderr-${name}`}>
                    {p.stderr === null ? '—' : p.stderr.toPrecision(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.reduced_chi2 != null && (
            <p data-testid="fit-result-chi2">
              reduced χ² = {result.reduced_chi2.toPrecision(4)} (dof {result.dof})
            </p>
          )}
        </section>
      )}
    </div>
  );
}
