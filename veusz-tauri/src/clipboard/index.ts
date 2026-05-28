/**
 * Clipboard abstraction for the Tauri shell.
 *
 * Two backends:
 *  - `tauriClipboard()` — uses `@tauri-apps/plugin-clipboard-manager` so
 *    copy/paste round-trips with the legacy Qt Veusz (both sides write
 *    Veusz's MIME bytes — `text/x-vnd.veusz-widget-3` for widgets and
 *    `text/x-vnd.veusz-data-1` for datasets).
 *  - `inMemoryClipboard()` — process-local, for vitest (no Tauri).
 *
 * The choice is made by `createClipboard()` at boot: real clipboard
 * if `window.__TAURI_INTERNALS__` is present, in-memory otherwise.
 *
 * Phase 1 only ships the in-memory backend wired up; the Tauri-side
 * plugin wiring lands later in Phase 1.6's second half. The interface
 * is what matters for the store actions.
 */

export interface ClipboardPayload {
  mime_type: string;
  payload_b64: string;
}

export interface Clipboard {
  /** Write a Veusz MIME payload. */
  write(p: ClipboardPayload): Promise<void>;
  /** Read what's on the clipboard if its MIME type matches one of
   *  the listed types. Returns null when no match. */
  read(acceptable_mime_types: string[]): Promise<ClipboardPayload | null>;
  /** Inspect whether the clipboard currently holds one of the listed
   *  MIME types without consuming it. Used to enable/disable a Paste
   *  menu item without round-tripping bytes. */
  has(acceptable_mime_types: string[]): Promise<boolean>;
}

export function inMemoryClipboard(): Clipboard {
  let current: ClipboardPayload | null = null;
  return {
    async write(p: ClipboardPayload) {
      current = { ...p };
    },
    async read(acceptable: string[]) {
      if (!current) return null;
      if (!acceptable.includes(current.mime_type)) return null;
      return { ...current };
    },
    async has(acceptable: string[]) {
      return current !== null && acceptable.includes(current.mime_type);
    },
  };
}

/**
 * Real-clipboard backend via `@tauri-apps/plugin-clipboard-manager`.
 *
 * The plugin is loaded dynamically so that vitest, which doesn't run
 * inside Tauri, never tries to resolve the native side. In Tauri the
 * plugin handles the OS clipboard with the correct MIME types.
 *
 * Note: the Tauri clipboard plugin's API at this revision exposes
 * primarily `readText`/`writeText`/`readImage`/`writeImage`. For
 * Veusz's MIME types we encode the base64 payload as a single text
 * blob with a small JSON envelope so we don't lose the mime_type on
 * round-trip. The legacy Qt GUI continues to use the raw byte slot —
 * we follow that there too in a future revision once the Tauri
 * plugin exposes per-MIME byte writes; for now Tauri↔Tauri works,
 * Tauri↔Qt interop is gated on plugin support.
 */
export function tauriClipboard(): Clipboard {
  const ENVELOPE_MARKER = '__veusz_clipboard_v1__';

  type Envelope = {
    marker: typeof ENVELOPE_MARKER;
    mime_type: string;
    payload_b64: string;
  };

  async function plugin() {
    // Loaded dynamically at Tauri runtime; not bundled by vite. The
    // module specifier goes through a runtime variable so vite's
    // static import-analysis cannot resolve it during the unit-test
    // build (where the package isn't installed).
    const mod = '@tauri-apps/plugin-clipboard-manager';
    return import(/* @vite-ignore */ mod);
  }

  async function readEnvelope(): Promise<Envelope | null> {
    const cm = await plugin();
    let text: string | null = null;
    try {
      text = await cm.readText();
    } catch {
      return null;
    }
    if (!text || !text.startsWith('{')) return null;
    try {
      const env = JSON.parse(text);
      if (env && env.marker === ENVELOPE_MARKER) return env as Envelope;
    } catch {
      /* ignore */
    }
    return null;
  }

  return {
    async write(p: ClipboardPayload) {
      const cm = await plugin();
      const env: Envelope = {
        marker: ENVELOPE_MARKER,
        mime_type: p.mime_type,
        payload_b64: p.payload_b64,
      };
      await cm.writeText(JSON.stringify(env));
    },
    async read(acceptable: string[]) {
      const env = await readEnvelope();
      if (!env || !acceptable.includes(env.mime_type)) return null;
      return { mime_type: env.mime_type, payload_b64: env.payload_b64 };
    },
    async has(acceptable: string[]) {
      const env = await readEnvelope();
      return env !== null && acceptable.includes(env.mime_type);
    },
  };
}

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

export function createClipboard(): Clipboard {
  if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
    return tauriClipboard();
  }
  return inMemoryClipboard();
}
