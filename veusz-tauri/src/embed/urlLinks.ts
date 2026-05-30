/**
 * Drive the URL data sources of an embedded Veusz figure.
 *
 * The `.vsz` is canonical — every `ImportFileURL(...)` it contains shows up
 * via `data.list_url_links`. For each link we:
 *   1. resolve the fetch URL (an explicit `urlMap` override wins; else the
 *      `.vsz`-side URL is resolved against an optional `urlBase`),
 *   2. `fetch()` with conditional GET (`If-None-Match` / `If-Modified-Since`
 *      using the cached state Python knows about),
 *   3. hand the result to `data.url_refresh` — either the 304 short-circuit
 *      or `(bytes_b64, etag, last_modified, content_type)`.
 *
 * The cache key inside Python is always the original `.vsz` URL, not the
 * rewritten one — so a downloaded `.vsz` always reflects what the author
 * wrote, even when the embed page retargets fetches.
 *
 * Per-link `poll_seconds` (set in the `.vsz`) installs a `setInterval` that
 * runs the same fetch step. `controller.stop()` clears every interval; call
 * it from `<veusz-figure>`'s `disconnectedCallback`.
 */

import type { Transport } from '../rpc/transport';

export interface UrlLinkEntry {
  url: string;
  format: string;
  poll_seconds: number;
  names: string[];
  etag: string | null;
  last_modified: string | null;
}

export type UrlLinkPhase = 'fetching' | 'ok' | 'not_modified' | 'error';

export interface UrlLinkStatus {
  url: string;
  phase: UrlLinkPhase;
  detail?: string;
}

export interface WireUrlLinksOptions {
  /** Base URL for resolving relative URLs in the `.vsz`. Defaults to the
   *  page's location when omitted; `<veusz-figure>` passes the `.vsz`'s own
   *  directory so a relative `pressure.csv` next to the `.vsz` just works. */
  urlBase?: string;
  /** Per-original-URL → replacement-URL overrides. Wins over `urlBase` when
   *  the original URL is a key. The original URL stays the Python cache key,
   *  so a downloaded `.vsz` is unaffected. */
  urlMap?: Record<string, string>;
  /** Phase updates (per link). Default: no-op. */
  onStatus?: (s: UrlLinkStatus) => void;
  /** Error reporter. Default: `console.warn`. Errors do NOT stop polling —
   *  one bad URL doesn't kill the loop. */
  onError?: (url: string, err: Error) => void;
}

export interface UrlLinkController {
  /** Cancel every polling interval. */
  stop(): void;
}

interface LinkState {
  etag: string | null;
  lastModified: string | null;
}

export async function wireUrlLinks(
  transport: Transport,
  opts: WireUrlLinksOptions = {},
): Promise<UrlLinkController> {
  const links = (await transport.call('data.list_url_links', {})) as UrlLinkEntry[];
  const onErr = opts.onError ?? ((url, err) =>
    console.warn(`[veusz-figure] URL ${url}: ${err.message}`));
  const onStatus = opts.onStatus ?? (() => {});

  // Per-URL conditional-GET state, seeded from what Python already knows.
  const state = new Map<string, LinkState>();
  for (const link of links) {
    state.set(link.url, { etag: link.etag, lastModified: link.last_modified });
  }

  const resolveFetchURL = (orig: string): string => {
    if (opts.urlMap && Object.prototype.hasOwnProperty.call(opts.urlMap, orig)) {
      return opts.urlMap[orig];
    }
    if (opts.urlBase) {
      try { return new URL(orig, opts.urlBase).toString(); }
      catch { return orig; }
    }
    return orig;
  };

  const tick = async (link: UrlLinkEntry): Promise<void> => {
    const fetchURL = resolveFetchURL(link.url);
    const s = state.get(link.url)!;
    const headers: Record<string, string> = {};
    if (s.etag) headers['If-None-Match'] = s.etag;
    if (s.lastModified) headers['If-Modified-Since'] = s.lastModified;
    onStatus({ url: link.url, phase: 'fetching' });
    try {
      const resp = await fetch(fetchURL, { headers, cache: 'no-store' });
      if (resp.status === 304) {
        await transport.call('data.url_refresh',
          { url: link.url, not_modified: true });
        onStatus({ url: link.url, phase: 'not_modified' });
        return;
      }
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const buf = new Uint8Array(await resp.arrayBuffer());
      const bytes_b64 = bytesToBase64(buf);
      const etag = resp.headers.get('etag');
      const last_modified = resp.headers.get('last-modified');
      const content_type = resp.headers.get('content-type');
      await transport.call('data.url_refresh', {
        url: link.url, bytes_b64,
        etag, last_modified, content_type,
      });
      s.etag = etag;
      s.lastModified = last_modified;
      onStatus({ url: link.url, phase: 'ok' });
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      onErr(link.url, err);
      onStatus({ url: link.url, phase: 'error', detail: err.message });
    }
  };

  // Initial pass in parallel — don't install polling intervals until each
  // link's first attempt resolves (success or failure), so a broken URL
  // doesn't burn cycles before we know about it.
  await Promise.allSettled(links.map((l) => tick(l)));

  const timers: ReturnType<typeof setInterval>[] = [];
  for (const link of links) {
    if (link.poll_seconds > 0) {
      const id = setInterval(() => { void tick(link); },
        link.poll_seconds * 1000);
      timers.push(id);
    }
  }

  return {
    stop() {
      for (const id of timers) clearInterval(id);
      timers.length = 0;
    },
  };
}

/**
 * Pre-fetch every URL the .vsz references and feed the bytes into the Pyodide
 * cache via `data.url_ingest`, so the subsequent `loadVsz()` finds them. The
 * Pyodide cache-only fetcher otherwise raises during `.vsz` load (since the
 * `ImportFileURL` calls in the script run sync, before JS has any chance to
 * fetch). Call this *before* `runtime.loadVsz(text)`.
 *
 * Returns the list of URLs it tried to pre-fetch (useful for tests).
 *
 * The regex matches the exact shape `LinkedFileURL.saveToFile` emits —
 * `ImportFileURL('url', ...)` or `ImportFileURL("url", ...)`. Users writing
 * .vsz scripts by hand should follow that convention; URLs constructed by
 * string concatenation aren't pre-fetched and will fail under Pyodide.
 */
export async function prefetchUrlsInVsz(
  vszText: string,
  transport: Transport,
  opts: WireUrlLinksOptions = {},
): Promise<string[]> {
  const urls = extractImportFileURLs(vszText);
  const onErr = opts.onError ?? ((url, err) =>
    console.warn(`[veusz-figure] pre-fetch ${url}: ${err.message}`));
  await Promise.allSettled(urls.map(async (orig) => {
    const fetchURL =
      (opts.urlMap && Object.prototype.hasOwnProperty.call(opts.urlMap, orig))
        ? opts.urlMap[orig]
        : (opts.urlBase ? new URL(orig, opts.urlBase).toString() : orig);
    try {
      const resp = await fetch(fetchURL, { cache: 'no-store' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const buf = new Uint8Array(await resp.arrayBuffer());
      await transport.call('data.url_ingest', {
        url: orig,                    // Python's cache key = original URL
        bytes_b64: bytesToBase64(buf),
        etag: resp.headers.get('etag'),
        last_modified: resp.headers.get('last-modified'),
        content_type: resp.headers.get('content-type'),
      });
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      onErr(orig, err);
    }
  }));
  return urls;
}

function extractImportFileURLs(vszText: string): string[] {
  const out: string[] = [];
  const re = /ImportFileURL\s*\(\s*(['"])([^'"\n]+)\1/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(vszText)) !== null) out.push(m[2]);
  return out;
}

/** Base64-encode a byte array, chunking to avoid call-stack overflow on
 *  large `String.fromCharCode(...)` calls. */
function bytesToBase64(buf: Uint8Array): string {
  let s = '';
  const chunk = 0x8000;
  for (let i = 0; i < buf.length; i += chunk) {
    s += String.fromCharCode.apply(null,
      Array.from(buf.subarray(i, i + chunk)));
  }
  return btoa(s);
}
