/**
 * In-memory clipboard backend roundtrip tests.
 *
 * The Tauri-side plugin code path is exercised by an integration test
 * once the plugin is wired into the Rust shell; for vitest we use the
 * in-memory backend which has no I/O.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { inMemoryClipboard } from './index';

const WIDGET_MIME = 'text/x-vnd.veusz-widget-3';
const DATA_MIME = 'text/x-vnd.veusz-data-1';

describe('inMemoryClipboard', () => {
  let cb = inMemoryClipboard();
  beforeEach(() => {
    cb = inMemoryClipboard();
  });

  it('is initially empty', async () => {
    expect(await cb.has([WIDGET_MIME])).toBe(false);
    expect(await cb.read([WIDGET_MIME])).toBeNull();
  });

  it('round-trips a widget payload', async () => {
    await cb.write({ mime_type: WIDGET_MIME, payload_b64: 'AAAA' });
    expect(await cb.has([WIDGET_MIME])).toBe(true);
    const r = await cb.read([WIDGET_MIME]);
    expect(r).toEqual({ mime_type: WIDGET_MIME, payload_b64: 'AAAA' });
  });

  it('refuses to surface a payload whose MIME is not in the accept list', async () => {
    await cb.write({ mime_type: WIDGET_MIME, payload_b64: 'AAAA' });
    expect(await cb.has([DATA_MIME])).toBe(false);
    expect(await cb.read([DATA_MIME])).toBeNull();
    // But the original widget MIME is still readable.
    expect(await cb.has([WIDGET_MIME])).toBe(true);
  });

  it('overwrites previous content on write', async () => {
    await cb.write({ mime_type: WIDGET_MIME, payload_b64: 'AAAA' });
    await cb.write({ mime_type: DATA_MIME, payload_b64: 'BBBB' });
    expect(await cb.has([WIDGET_MIME])).toBe(false);
    const r = await cb.read([DATA_MIME]);
    expect(r?.payload_b64).toBe('BBBB');
  });

  it('accepts either MIME when both are listed', async () => {
    await cb.write({ mime_type: DATA_MIME, payload_b64: 'C' });
    const r = await cb.read([WIDGET_MIME, DATA_MIME]);
    expect(r?.mime_type).toBe(DATA_MIME);
  });
});
