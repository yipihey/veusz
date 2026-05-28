/**
 * Python console — runs code in the daemon's CommandInterpreter via the
 * eval.python RPC (the power-user escape hatch, mirroring Qt's console
 * window). Shows stdout/stderr/result and a simple history (↑/↓).
 */

import { useRef, useState } from 'react';
import type { DocStore } from '../../keys/shortcuts';

interface Entry { code: string; out: string; err: boolean }

export function ConsolePanel({ store }: { store: DocStore }) {
  const rpc = store.getState().rpc;
  const [code, setCode] = useState('');
  const [log, setLog] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(false);
  const history = useRef<string[]>([]);
  const hpos = useRef<number>(-1);

  const submit = async () => {
    const c = code.trim();
    if (!c || busy) return;
    history.current.push(c);
    hpos.current = history.current.length;
    setCode('');
    setBusy(true);
    try {
      const r = await rpc.eval.python(c);
      const parts = [r.stdout, r.stderr,
        r.result !== null && r.result !== undefined ? String(r.result) : '']
        .filter(Boolean).join('\n');
      setLog((l) => [...l, { code: c, out: parts, err: !!r.stderr }]);
    } catch (e) {
      setLog((l) => [...l, { code: c, out: (e as Error).message, err: true }]);
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); void submit(); }
    else if (e.key === 'ArrowUp' && e.ctrlKey) {
      e.preventDefault();
      hpos.current = Math.max(0, hpos.current - 1);
      setCode(history.current[hpos.current] ?? '');
    } else if (e.key === 'ArrowDown' && e.ctrlKey) {
      e.preventDefault();
      hpos.current = Math.min(history.current.length, hpos.current + 1);
      setCode(history.current[hpos.current] ?? '');
    }
  };

  return (
    <div data-testid="console" style={{ minWidth: 480, fontSize: 12 }}>
      <div data-testid="console-log" style={logStyle}>
        {log.length === 0 && <div style={{ color: '#999' }}>Veusz Python console — try <code>GetData('x')</code>. Ctrl/⌘+Enter runs.</div>}
        {log.map((e, i) => (
          <div key={i}>
            <div style={{ color: '#1f6feb' }}>&gt;&gt;&gt; {e.code}</div>
            {e.out && <pre style={{ margin: 0, color: e.err ? '#b00020' : '#222', whiteSpace: 'pre-wrap' }}>{e.out}</pre>}
          </div>
        ))}
      </div>
      <textarea
        data-testid="console-input"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={onKey}
        spellCheck={false}
        placeholder="Python — Ctrl/⌘+Enter to run"
        style={{ width: '100%', height: 64, font: '12px monospace', boxSizing: 'border-box' }}
      />
      <div style={{ textAlign: 'right', marginTop: 4 }}>
        <button type="button" data-testid="console-run" disabled={busy} onClick={() => void submit()}>
          {busy ? 'Running…' : 'Run'}
        </button>
      </div>
    </div>
  );
}

const logStyle: React.CSSProperties = {
  height: 240, overflow: 'auto', border: '1px solid #ddd', borderRadius: 4,
  padding: 8, font: '12px monospace', background: '#fcfcfc', marginBottom: 8,
};
