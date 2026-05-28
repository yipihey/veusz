/**
 * Dataset Create / Create-2D / Filter / Histogram dialog — one component with
 * a mode per Data-menu item, over the data.create/create_2d/filter/histogram
 * RPCs. On success it refreshes the dataset list and closes.
 */

import { useState } from 'react';
import type { DocStore } from '../../keys/shortcuts';

export type DataMode = 'create1d' | 'create2d' | 'filter' | 'histogram';

export function DataDialog({
  store, mode, onClose, notify,
}: { store: DocStore; mode: DataMode; onClose: () => void; notify: (m: string) => void }) {
  const s = store();
  const [busy, setBusy] = useState(false);
  const rpc = s.rpc;

  const run = async (fn: () => Promise<{ created: string[] }>) => {
    setBusy(true);
    try {
      const r = await fn();
      await store.getState().refreshDatasets();
      notify(`Created: ${r.created.join(', ') || '(none)'}`);
      onClose();
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid={`datadlg-${mode}`} style={{ minWidth: 380, fontSize: 13 }}>
      {mode === 'create1d' && <Create1D rpc={rpc} busy={busy} run={run} />}
      {mode === 'create2d' && <Create2D rpc={rpc} busy={busy} run={run} />}
      {mode === 'filter' && <Filter rpc={rpc} datasets={s.datasets.map((d) => d.name)} busy={busy} run={run} />}
      {mode === 'histogram' && <Histogram rpc={rpc} datasets={s.datasets.map((d) => d.name)} busy={busy} run={run} />}
    </div>
  );
}

type Rpc = DocStore extends { getState: () => { rpc: infer R } } ? R : never;
type RunFn = (fn: () => Promise<{ created: string[] }>) => void;

function Create1D({ rpc, busy, run }: { rpc: Rpc; busy: boolean; run: RunFn }) {
  const [name, setName] = useState('newdata');
  const [cmode, setCmode] = useState<'expression' | 'range' | 'parametric'>('expression');
  const [expr, setExpr] = useState('');
  const [nsteps, setNsteps] = useState(100);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(1);
  return (
    <>
      <Field label="Name"><input data-testid="dc-name" value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label="Method">
        <select data-testid="dc-mode" value={cmode} onChange={(e) => setCmode(e.target.value as typeof cmode)}>
          <option value="expression">Expression</option>
          <option value="range">Range (linspace)</option>
          <option value="parametric">Parametric</option>
        </select>
      </Field>
      {(cmode === 'expression' || cmode === 'parametric') && (
        <Field label="Expression"><input data-testid="dc-expr" value={expr} onChange={(e) => setExpr(e.target.value)} placeholder={cmode === 'parametric' ? 'cos(t)' : 'x*2 + 1'} /></Field>
      )}
      {(cmode === 'range' || cmode === 'parametric') && (
        <Field label="Steps / min / max">
          <input data-testid="dc-nsteps" type="number" value={nsteps} onChange={(e) => setNsteps(+e.target.value)} style={num} />
          <input data-testid="dc-min" type="number" value={min} onChange={(e) => setMin(+e.target.value)} style={num} />
          <input data-testid="dc-max" type="number" value={max} onChange={(e) => setMax(+e.target.value)} style={num} />
        </Field>
      )}
      <Submit busy={busy} testid="dc-create" onClick={() => run(() => rpc.data.create({ name, mode: cmode, expr, nsteps, min, max }))} />
    </>
  );
}

function Create2D({ rpc, busy, run }: { rpc: Rpc; busy: boolean; run: RunFn }) {
  const [name, setName] = useState('newdata2d');
  const [expr, setExpr] = useState('x+y');
  const [xstep, setXstep] = useState('0,1,0.1');
  const [ystep, setYstep] = useState('0,1,0.1');
  return (
    <>
      <Field label="Name"><input data-testid="d2-name" value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label="z = f(x, y)"><input data-testid="d2-expr" value={expr} onChange={(e) => setExpr(e.target.value)} /></Field>
      <Field label="x min,max,step"><input data-testid="d2-xstep" value={xstep} onChange={(e) => setXstep(e.target.value)} /></Field>
      <Field label="y min,max,step"><input data-testid="d2-ystep" value={ystep} onChange={(e) => setYstep(e.target.value)} /></Field>
      <Submit busy={busy} testid="d2-create" onClick={() => run(() => rpc.data.create2d({
        name, mode: 'xyfunc', expr,
        xstep: xstep.split(',').map(Number), ystep: ystep.split(',').map(Number),
      }))} />
    </>
  );
}

function Filter({ rpc, datasets, busy, run }: { rpc: Rpc; datasets: string[]; busy: boolean; run: RunFn }) {
  const [filter, setFilter] = useState('');
  const [sel, setSel] = useState<string[]>([]);
  const [prefix, setPrefix] = useState('f_');
  const [invert, setInvert] = useState(false);
  return (
    <>
      <Field label="Filter (e.g. x>0)"><input data-testid="flt-expr" value={filter} onChange={(e) => setFilter(e.target.value)} /></Field>
      <Field label="Datasets">
        <select data-testid="flt-datasets" multiple value={sel} style={{ minWidth: 160, minHeight: 60 }}
          onChange={(e) => setSel([...e.target.selectedOptions].map((o) => o.value))}>
          {datasets.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </Field>
      <Field label="Prefix"><input data-testid="flt-prefix" value={prefix} onChange={(e) => setPrefix(e.target.value)} /></Field>
      <Field label="Invert"><input data-testid="flt-invert" type="checkbox" checked={invert} onChange={(e) => setInvert(e.target.checked)} /></Field>
      <Submit busy={busy} testid="flt-run" onClick={() => run(() => rpc.data.filter({ filter, datasets: sel, prefix, invert }))} />
    </>
  );
}

function Histogram({ rpc, datasets, busy, run }: { rpc: Rpc; datasets: string[]; busy: boolean; run: RunFn }) {
  const [expr, setExpr] = useState(datasets[0] ?? '');
  const [outbins, setOutbins] = useState('bins');
  const [outvals, setOutvals] = useState('counts');
  const [bins, setBins] = useState(10);
  const [method, setMethod] = useState('counts');
  return (
    <>
      <Field label="Input dataset/expr"><input data-testid="hist-expr" value={expr} onChange={(e) => setExpr(e.target.value)} /></Field>
      <Field label="Out bins / values">
        <input data-testid="hist-outbins" value={outbins} onChange={(e) => setOutbins(e.target.value)} />
        <input data-testid="hist-outvals" value={outvals} onChange={(e) => setOutvals(e.target.value)} />
      </Field>
      <Field label="Bins"><input data-testid="hist-bins" type="number" value={bins} onChange={(e) => setBins(+e.target.value)} style={num} /></Field>
      <Field label="Method">
        <select data-testid="hist-method" value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="counts">Counts</option>
          <option value="density">Density</option>
          <option value="fractions">Fractions</option>
        </select>
      </Field>
      <Submit busy={busy} testid="hist-run" onClick={() => run(() => rpc.data.histogram({ expr, outbins, outvals, bins, method }))} />
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
      <span style={{ flex: 1 }}>{label}</span>
      <span style={{ display: 'flex', gap: 4 }}>{children}</span>
    </label>
  );
}

function Submit({ busy, onClick, testid }: { busy: boolean; onClick: () => void; testid: string }) {
  return (
    <div style={{ textAlign: 'right', marginTop: 8 }}>
      <button type="button" data-testid={testid} disabled={busy} onClick={onClick}>
        {busy ? 'Working…' : 'Create'}
      </button>
    </div>
  );
}

const num: React.CSSProperties = { width: 70 };
