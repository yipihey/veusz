import { useEffect, useState } from 'react';
import type { Rpc } from '../../rpc/client';
import type { WidgetSchema } from '../../rpc/types';
import { Inspector } from '../inspector/Inspector';
import { collectSettingPaths } from '../../state/doc';

/**
 * Stylesheet editor.
 *
 * Veusz's stylesheet is a `Settings` group at ``/StyleSheet`` on the
 * document — not a widget — so it can't be reached through the
 * widget-typename Inspector path. We fetch the live schema via
 * ``doc.schema_at`` and feed it into the existing Inspector, which
 * happily renders any group-shaped schema.
 *
 * Mounts on demand and refetches on every daemon push so the editor
 * stays consistent with the rest of the app.
 */
export interface StylesheetEditorProps {
  rpc: Rpc;
  /** Sets a single stylesheet path; the host wires this to doc.set / store. */
  onChange: (path: string, value: unknown) => void;
  /** Optional: pre-fetched values so we don't re-issue doc.get on mount. */
  initialValues?: Record<string, unknown>;
}

const ROOT = '/StyleSheet';

export function StylesheetEditor({ rpc, onChange, initialValues }: StylesheetEditorProps) {
  const [schema, setSchema] = useState<WidgetSchema | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>(initialValues ?? {});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    rpc.doc
      .schemaAt(ROOT)
      .then(async (sch) => {
        if (cancelled) return;
        setSchema(sch);
        const paths = collectSettingPaths(sch, ROOT);
        try {
          const vs = await rpc.doc.get(paths);
          if (!cancelled) setValues(vs);
        } catch (e) {
          if (!cancelled) setError((e as Error).message);
        }
      })
      .catch((e: Error) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [rpc]);

  const handleChange = (path: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [path]: value }));
    onChange(path, value);
  };

  if (error) {
    return <p data-testid="stylesheet-error" role="alert" style={{ color: 'crimson' }}>{error}</p>;
  }
  if (!schema) {
    return <p data-testid="stylesheet-loading">Loading stylesheet…</p>;
  }

  return (
    <div data-testid="stylesheet-editor">
      <h3>Stylesheet</h3>
      <Inspector
        schema={schema}
        widgetPaths={[ROOT]}
        values={values}
        onChange={handleChange}
      />
    </div>
  );
}
