/**
 * Local (sidecar) data files for the embed.
 *
 * A `.vsz` often pulls data from files next to it — `ImportFile('spectrum.dat')`,
 * `ImportFileCSV('data.csv')`, `ImportFile2D('grid.dat', …)`, etc. In the
 * browser the document runs inside Pyodide's in-memory filesystem, so those
 * files don't exist unless we fetch them and write them in alongside the `.vsz`
 * before it loads. This mirrors what `urlLinks.ts` does for `ImportFileURL`,
 * but for plain relative-path imports.
 *
 * We deliberately do NOT touch `ImportFileURL(...)` here — those carry an
 * absolute/relative URL handled by the polling layer in `urlLinks.ts`.
 */

export interface LocalDataFile {
  /** Path as written in the .vsz (relative to the document), e.g. "spectrum.dat". */
  name: string;
  bytes: Uint8Array;
}

// First string argument of any Import* call. Veusz .vsz files write Python
// string literals, often with a `u`/`r`/`b` prefix (e.g. `ImportFileCSV(u'x.csv')`),
// so allow that prefix. `ImportFileURL` matches too but is filtered out below
// (its arg is a URL).
const IMPORT_RE = /\bImport[A-Za-z0-9]*\s*\(\s*[uUrRbB]?(['"])([^'"\n]+)\1/g;

/**
 * Extract the relative data-file names a `.vsz` imports. Skips URLs (handled by
 * urlLinks) and arguments that don't look like filenames (e.g. the dataset-name
 * first argument of `ImportString`), so a stray fetch isn't attempted for them.
 */
export function extractDataFileNames(vszText: string): string[] {
  const out = new Set<string>();
  for (const m of vszText.matchAll(IMPORT_RE)) {
    const arg = m[2];
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(arg)) continue; // URL → urlLinks.ts
    if (!/\.[A-Za-z0-9]+$/.test(arg)) continue;          // no extension → not a file
    out.add(arg);
  }
  return [...out];
}

/**
 * Fetch every sidecar data file a `.vsz` references, resolved relative to the
 * document's own URL. Missing files are skipped (a `.vsz` may reference data
 * that isn't co-located); the figure still loads, just without that dataset.
 * `urlBase`/`urlMap` mirror the `<veusz-figure>` data-url overrides so a gallery
 * can relocate data without editing the documents.
 */
export async function fetchDataFiles(
  vszText: string,
  srcUrl: string,
  opts: { urlBase?: string; urlMap?: Record<string, string> } = {},
  doFetch: typeof fetch = fetch,
): Promise<LocalDataFile[]> {
  const names = extractDataFileNames(vszText);
  if (names.length === 0) return [];
  const base = opts.urlBase
    ? new URL(opts.urlBase, location.href)
    : new URL('.', new URL(srcUrl, location.href));
  const out: LocalDataFile[] = [];
  await Promise.all(names.map(async (name) => {
    const target = opts.urlMap?.[name] ?? new URL(name, base).toString();
    try {
      const r = await doFetch(target);
      if (!r.ok) return;
      out.push({ name, bytes: new Uint8Array(await r.arrayBuffer()) });
    } catch {
      /* unreachable data file — skip, document still loads */
    }
  }));
  return out;
}
