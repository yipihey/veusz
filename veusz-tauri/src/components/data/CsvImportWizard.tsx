import { useEffect, useState } from 'react';
import type { Rpc } from '../../rpc/client';

/**
 * CSV import wizard. The four-decade "settings on the left, preview
 * on the right" shape Veusz users know — but live, driven by
 * `data.preview_csv` so the preview updates as the user fiddles with
 * delimiter / encoding / header-skip.
 *
 * On Import → calls `data.import('csv', ...)` with the final options
 * and invokes `onImported(names)` so the host can refresh its dataset
 * list / select the new datasets / dismiss the dialog.
 */

export interface CsvImportWizardProps {
  rpc: Rpc;
  filename: string;
  onImported: (names: string[]) => void;
  onCancel: () => void;
}

type Delimiter = ',' | '\t' | ';' | '|' | ' ' | 'custom';

const DELIMITER_OPTIONS: Array<{ value: Delimiter; label: string }> = [
  { value: ',', label: 'Comma (,)' },
  { value: '\t', label: 'Tab' },
  { value: ';', label: 'Semicolon (;)' },
  { value: '|', label: 'Pipe (|)' },
  { value: ' ', label: 'Space' },
  { value: 'custom', label: 'Custom…' },
];

const ENCODINGS = ['utf-8', 'latin-1', 'utf-16', 'ascii', 'cp1252'];

const HEADER_MODES = [
  { value: 'multi', label: 'Multiple (one per section)' },
  { value: '1st', label: 'First non-blank row' },
  { value: 'none', label: 'No header (auto-name)' },
];

export function CsvImportWizard({
  rpc, filename, onImported, onCancel,
}: CsvImportWizardProps) {
  const [delimiter, setDelimiter] = useState<Delimiter>(',');
  const [customDelimiter, setCustomDelimiter] = useState(',');
  const [textDelimiter, setTextDelimiter] = useState('"');
  const [encoding, setEncoding] = useState('utf-8');
  const [rowsIgnore, setRowsIgnore] = useState(0);
  const [headerIgnore, setHeaderIgnore] = useState(0);
  const [headerMode, setHeaderMode] = useState('multi');
  const [dsprefix, setDsprefix] = useState('');
  const [dssuffix, setDssuffix] = useState('');

  const [preview, setPreview] = useState<{
    header: string[]; rows: string[][];
    total_lines_estimated: number; truncated: boolean;
  } | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const effectiveDelimiter = delimiter === 'custom' ? customDelimiter : delimiter;

  useEffect(() => {
    let cancelled = false;
    setPreviewError(null);
    rpc.data
      .previewCsv({
        filename,
        delimiter: effectiveDelimiter,
        text_delimiter: textDelimiter,
        encoding,
        rows_ignore: rowsIgnore,
        header_ignore: headerIgnore,
        max_rows: 20,
      })
      .then((r) => { if (!cancelled) setPreview(r); })
      .catch((e: Error) => { if (!cancelled) { setPreview(null); setPreviewError(e.message); } });
    return () => { cancelled = true; };
  }, [rpc, filename, effectiveDelimiter, textDelimiter, encoding, rowsIgnore, headerIgnore]);

  const handleImport = async () => {
    setImporting(true);
    setImportError(null);
    try {
      const r = await rpc.data.import('csv', filename, {
        delimiter: effectiveDelimiter,
        textdelimiter: textDelimiter,
        encoding: encoding.replace('-', '_'),
        rowsignore: rowsIgnore,
        headerignore: headerIgnore,
        headermode: headerMode,
        dsprefix,
        dssuffix,
      });
      onImported(r.imported);
    } catch (e) {
      setImportError((e as Error).message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div data-testid="csv-wizard" role="dialog" aria-label="Import CSV"
      style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16,
               padding: 16, background: '#fff', border: '1px solid #ccc',
               maxWidth: 900 }}
    >
      <div>
        <h3>Import CSV</h3>
        <p data-testid="csv-wizard-filename" style={{ color: '#666', fontSize: 12 }}>
          {filename}
        </p>

        <Field label="Delimiter">
          <select
            value={delimiter}
            data-testid="csv-delimiter"
            onChange={(e) => setDelimiter(e.target.value as Delimiter)}
          >
            {DELIMITER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {delimiter === 'custom' && (
            <input
              type="text"
              value={customDelimiter}
              maxLength={4}
              data-testid="csv-delimiter-custom"
              onChange={(e) => setCustomDelimiter(e.target.value)}
              style={{ width: 60, marginLeft: 8 }}
            />
          )}
        </Field>

        <Field label="Text quoting">
          <select
            value={textDelimiter}
            data-testid="csv-text-delimiter"
            onChange={(e) => setTextDelimiter(e.target.value)}
          >
            <option value='"'>Double quotes</option>
            <option value="'">Single quotes</option>
            <option value="">None</option>
          </select>
        </Field>

        <Field label="Encoding">
          <select
            value={encoding}
            data-testid="csv-encoding"
            onChange={(e) => setEncoding(e.target.value)}
          >
            {ENCODINGS.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </Field>

        <Field label="Header mode">
          <select
            value={headerMode}
            data-testid="csv-header-mode"
            onChange={(e) => setHeaderMode(e.target.value)}
          >
            {HEADER_MODES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Skip rows (top)">
          <input
            type="number"
            min={0}
            value={rowsIgnore}
            data-testid="csv-rows-ignore"
            onChange={(e) => setRowsIgnore(Math.max(0, Number(e.target.value) || 0))}
          />
        </Field>

        <Field label="Skip rows after header">
          <input
            type="number"
            min={0}
            value={headerIgnore}
            data-testid="csv-header-ignore"
            onChange={(e) => setHeaderIgnore(Math.max(0, Number(e.target.value) || 0))}
          />
        </Field>

        <Field label="Dataset name prefix">
          <input
            type="text"
            value={dsprefix}
            data-testid="csv-prefix"
            onChange={(e) => setDsprefix(e.target.value)}
          />
        </Field>

        <Field label="Dataset name suffix">
          <input
            type="text"
            value={dssuffix}
            data-testid="csv-suffix"
            onChange={(e) => setDssuffix(e.target.value)}
          />
        </Field>

        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button
            type="button"
            data-testid="csv-cancel"
            onClick={() => onCancel()}
            disabled={importing}
          >
            Cancel
          </button>
          <button
            type="button"
            data-testid="csv-import"
            onClick={() => void handleImport()}
            disabled={importing || !preview}
          >
            {importing ? 'Importing…' : 'Import'}
          </button>
          {importError && (
            <span data-testid="csv-import-error" role="alert"
              style={{ color: 'crimson', fontSize: 12 }}>{importError}</span>
          )}
        </div>
      </div>

      <div data-testid="csv-preview">
        <h4>Preview</h4>
        {previewError && (
          <p data-testid="csv-preview-error" role="alert"
            style={{ color: 'crimson' }}>{previewError}</p>
        )}
        {preview && (
          <>
            <p data-testid="csv-preview-meta" style={{ fontSize: 12, color: '#666' }}>
              {preview.total_lines_estimated} lines total
              {preview.truncated && ' · preview truncated'}
            </p>
            <table data-testid="csv-preview-table" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {preview.header.map((h, i) => (
                    <th key={i} data-testid={`csv-col-${i}`}
                      style={{ borderBottom: '1px solid #ccc', padding: '2px 8px',
                               textAlign: 'left', fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, ri) => (
                  <tr key={ri} data-testid={`csv-row-${ri}`}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{ padding: '2px 8px', fontFamily: 'monospace',
                                            fontSize: 12 }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
      <span style={{ display: 'block', color: '#444', marginBottom: 2 }}>{label}</span>
      {children}
    </label>
  );
}
