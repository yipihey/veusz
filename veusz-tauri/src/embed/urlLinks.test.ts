import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { prefetchUrlsInVsz, wireUrlLinks, type UrlLinkEntry } from './urlLinks';
import type { Transport } from '../rpc/transport';

/** Build a minimal transport that records every `call(...)` and returns a
 *  configurable response per method. */
function makeTransport(handlers: Record<string, (params: unknown) => unknown>) {
  const calls: Array<{ method: string; params: unknown }> = [];
  const transport: Transport = {
    call: vi.fn(async (method, params) => {
      calls.push({ method, params: params ?? {} });
      const h = handlers[method];
      if (!h) throw new Error(`unmocked transport.call: ${method}`);
      return h(params);
    }),
    subscribe: vi.fn(() => () => {}),
  };
  return { transport, calls };
}

function fakeResponse(opts: {
  status?: number; body?: string; etag?: string | null;
  lastModified?: string | null; contentType?: string | null;
}) {
  const status = opts.status ?? 200;
  const headers = new Map<string, string>();
  if (opts.etag) headers.set('etag', opts.etag);
  if (opts.lastModified) headers.set('last-modified', opts.lastModified);
  if (opts.contentType) headers.set('content-type', opts.contentType);
  const body = opts.body ?? '';
  return {
    status, ok: status >= 200 && status < 300,
    headers: { get: (k: string) => headers.get(k.toLowerCase()) ?? null },
    arrayBuffer: async () => new TextEncoder().encode(body).buffer,
  } as unknown as Response;
}

describe('prefetchUrlsInVsz', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('extracts URLs from ImportFileURL lines + ingests bytes under the original URL', async () => {
    const vsz = [
      "ImportFileURL('http://example.com/data.csv', format='csv', linked=True)",
      "ImportFileURL(\"./pressure.csv\", format='csv', poll_seconds=5, linked=True)",
      "# not a URL: ImportFileCSV('local.csv')",
      "Add('page', name='page1')",
    ].join('\n');
    const { transport, calls } = makeTransport({
      'data.url_ingest': () => ({ ok: true, len: 0 }),
    });
    vi.stubGlobal('fetch', vi.fn(
      async (_url: string) => fakeResponse({ body: 'x\n1\n', etag: '"v1"' })));

    const urls = await prefetchUrlsInVsz(vsz, transport, {
      urlBase: 'https://lab.example.com/',
    });
    expect(urls).toEqual(['http://example.com/data.csv', './pressure.csv']);
    const ingestUrls = calls
      .filter((c) => c.method === 'data.url_ingest')
      .map((c) => (c.params as Record<string, unknown>).url)
      .sort();
    expect(ingestUrls).toEqual(['./pressure.csv', 'http://example.com/data.csv']);
  });

  it('fetches via urlMap/urlBase but ingests under the .vsz original URL', async () => {
    const vsz = "ImportFileURL('orig.csv', format='csv', linked=True)";
    const { transport, calls } = makeTransport({
      'data.url_ingest': () => ({ ok: true, len: 0 }),
    });
    const fetchSpy = vi.fn(
      async (_url: string) => fakeResponse({ body: 'a\n1\n' }));
    vi.stubGlobal('fetch', fetchSpy);

    await prefetchUrlsInVsz(vsz, transport, {
      urlBase: 'https://lab.example.com/run42/',
      urlMap: { 'orig.csv': 'https://lab.example.com/run43/x.csv' },
    });
    expect(fetchSpy.mock.calls[0][0]).toBe('https://lab.example.com/run43/x.csv');
    const p = calls.find((c) => c.method === 'data.url_ingest')!.params as Record<string, unknown>;
    expect(p.url).toBe('orig.csv');  // ORIGINAL — Python's key
  });

  it('tolerates fetch errors via onError; never throws', async () => {
    const vsz = "ImportFileURL('http://x/y.csv', format='csv')";
    const { transport } = makeTransport({
      'data.url_ingest': () => ({ ok: true, len: 0 }),
    });
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('boom'); }));
    const errs: string[] = [];
    await expect(prefetchUrlsInVsz(vsz, transport, {
      onError: (_u, e) => errs.push(e.message),
    })).resolves.toEqual(['http://x/y.csv']);
    expect(errs).toEqual(['boom']);
  });
});

describe('wireUrlLinks', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

  it('does an initial parallel fetch and forwards bytes to data.url_refresh', async () => {
    const link: UrlLinkEntry = {
      url: 'http://example.com/data.csv', format: 'csv',
      poll_seconds: 0, names: ['x', 'y'], etag: null, last_modified: null,
    };
    const { transport, calls } = makeTransport({
      'data.list_url_links': () => [link],
      'data.url_refresh': () => ({ reloaded: ['x', 'y'], errors: {}, not_modified: false }),
    });
    const fetchSpy = vi.fn(
      async (_url: string, _init?: RequestInit) => fakeResponse({
        body: 'x,y\n1,2\n', etag: '"v1"', contentType: 'text/csv',
      }));
    vi.stubGlobal('fetch', fetchSpy);

    const ctl = await wireUrlLinks(transport);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const refresh = calls.find((c) => c.method === 'data.url_refresh');
    expect(refresh).toBeDefined();
    const p = refresh!.params as Record<string, unknown>;
    expect(p.url).toBe('http://example.com/data.csv');
    expect(typeof p.bytes_b64).toBe('string');
    expect((p.bytes_b64 as string).length).toBeGreaterThan(0);
    expect(p.etag).toBe('"v1"');
    expect(p.content_type).toBe('text/csv');
    ctl.stop();
  });

  it('handles 304 with not_modified=true (no body sent)', async () => {
    const link: UrlLinkEntry = {
      url: 'http://example.com/data.csv', format: 'csv', poll_seconds: 0,
      names: ['x'], etag: '"v1"', last_modified: null,
    };
    const { transport, calls } = makeTransport({
      'data.list_url_links': () => [link],
      'data.url_refresh': () => ({ reloaded: [], errors: {}, not_modified: true }),
    });
    vi.stubGlobal('fetch', vi.fn(async () => fakeResponse({ status: 304 })));

    const ctl = await wireUrlLinks(transport);
    const refresh = calls.find((c) => c.method === 'data.url_refresh');
    expect(refresh).toBeDefined();
    const p = refresh!.params as Record<string, unknown>;
    expect(p.not_modified).toBe(true);
    expect(p.bytes_b64).toBeUndefined();
    ctl.stop();
  });

  it('sends If-None-Match using the cached ETag from list_url_links', async () => {
    const link: UrlLinkEntry = {
      url: 'http://example.com/data.csv', format: 'csv', poll_seconds: 0,
      names: ['x'], etag: '"v1"', last_modified: null,
    };
    const { transport } = makeTransport({
      'data.list_url_links': () => [link],
      'data.url_refresh': () => ({ reloaded: [], errors: {}, not_modified: true }),
    });
    const fetchSpy = vi.fn(
      async (_url: string, _init?: RequestInit) => fakeResponse({ status: 304 }));
    vi.stubGlobal('fetch', fetchSpy);

    const ctl = await wireUrlLinks(transport);
    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>)['If-None-Match']).toBe('"v1"');
    ctl.stop();
  });

  it('applies urlMap and urlBase to choose the actual fetch URL', async () => {
    const links: UrlLinkEntry[] = [
      { url: 'data.csv', format: 'csv', poll_seconds: 0, names: [], etag: null, last_modified: null },
      { url: 'http://orig/x.csv', format: 'csv', poll_seconds: 0, names: [], etag: null, last_modified: null },
    ];
    const { transport, calls } = makeTransport({
      'data.list_url_links': () => links,
      'data.url_refresh': () => ({ reloaded: [], errors: {}, not_modified: false }),
    });
    const fetchSpy = vi.fn(
      async (_url: string, _init?: RequestInit) => fakeResponse({
        body: 'x\n1\n', etag: null, contentType: 'text/csv',
      }));
    vi.stubGlobal('fetch', fetchSpy);

    const ctl = await wireUrlLinks(transport, {
      urlBase: 'https://lab.example.com/run42/',
      urlMap: { 'http://orig/x.csv': 'https://lab.example.com/special/x.csv' },
    });

    const fetched = fetchSpy.mock.calls.map((c) => c[0]).sort();
    expect(fetched).toEqual([
      'https://lab.example.com/run42/data.csv',
      'https://lab.example.com/special/x.csv',
    ]);
    // The Python cache key (data.url_refresh's `url`) is the ORIGINAL .vsz url.
    const refreshUrls = calls
      .filter((c) => c.method === 'data.url_refresh')
      .map((c) => (c.params as Record<string, unknown>).url)
      .sort();
    expect(refreshUrls).toEqual(['data.csv', 'http://orig/x.csv']);
    ctl.stop();
  });

  it('installs a polling interval for links with poll_seconds > 0', async () => {
    const link: UrlLinkEntry = {
      url: 'http://example.com/data.csv', format: 'csv', poll_seconds: 5,
      names: ['x'], etag: null, last_modified: null,
    };
    const { transport } = makeTransport({
      'data.list_url_links': () => [link],
      'data.url_refresh': () => ({ reloaded: ['x'], errors: {}, not_modified: false }),
    });
    const fetchSpy = vi.fn(
      async (_url: string, _init?: RequestInit) => fakeResponse({
        body: 'x\n1\n', etag: '"v1"',
      }));
    vi.stubGlobal('fetch', fetchSpy);

    const ctl = await wireUrlLinks(transport);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Advance the clock; expect a second fetch.
    await vi.advanceTimersByTimeAsync(5000);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    // Subsequent fetch sends If-None-Match using the ETag from the first response.
    const init2 = fetchSpy.mock.calls[1][1] as RequestInit;
    expect((init2.headers as Record<string, string>)['If-None-Match']).toBe('"v1"');

    // Stop clears the interval.
    ctl.stop();
    await vi.advanceTimersByTimeAsync(5000);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('refresh() re-fetches every link on demand, including those without poll_seconds', async () => {
    const links: UrlLinkEntry[] = [
      { url: 'http://example.com/a.csv', format: 'csv', poll_seconds: 0,
        names: ['a'], etag: null, last_modified: null },
      { url: 'http://example.com/b.csv', format: 'csv', poll_seconds: 0,
        names: ['b'], etag: null, last_modified: null },
    ];
    const { transport, calls } = makeTransport({
      'data.list_url_links': () => links,
      'data.url_refresh': () => ({ reloaded: [], errors: {}, not_modified: false }),
    });
    const fetchSpy = vi.fn(
      async (_url: string, _init?: RequestInit) => fakeResponse({
        body: 'x\n1\n', etag: '"v1"',
      }));
    vi.stubGlobal('fetch', fetchSpy);

    const ctl = await wireUrlLinks(transport);
    expect(fetchSpy).toHaveBeenCalledTimes(2);  // initial pass
    await ctl.refresh();
    expect(fetchSpy).toHaveBeenCalledTimes(4);  // refresh = one more per link
    // data.url_refresh fired twice more (one per link) on the refresh.
    expect(calls.filter((c) => c.method === 'data.url_refresh')).toHaveLength(4);
    ctl.stop();
  });

  it('reports a network error via onError; polling continues', async () => {
    const link: UrlLinkEntry = {
      url: 'http://example.com/data.csv', format: 'csv', poll_seconds: 2,
      names: [], etag: null, last_modified: null,
    };
    const { transport } = makeTransport({
      'data.list_url_links': () => [link],
      'data.url_refresh': () => ({ reloaded: [], errors: {}, not_modified: false }),
    });
    let n = 0;
    const fetchSpy = vi.fn(
      async (_url: string, _init?: RequestInit): Promise<Response> => {
        n++;
        if (n === 1) throw new Error('boom');
        return fakeResponse({ body: 'x\n1\n', etag: '"v1"' });
      });
    vi.stubGlobal('fetch', fetchSpy);
    const errs: Array<[string, string]> = [];

    const ctl = await wireUrlLinks(transport, {
      onError: (u, e) => errs.push([u, e.message]),
    });
    expect(errs).toEqual([['http://example.com/data.csv', 'boom']]);
    // After error, polling still installed.
    await vi.advanceTimersByTimeAsync(2000);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    ctl.stop();
  });
});
