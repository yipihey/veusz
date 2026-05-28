/**
 * Clipboard abstraction for the Tauri shell.
 *
 * Two backends:
 *  - `tauriClipboard()` — custom Tauri commands backed by NSPasteboard
 *    (src-tauri/src/clipboard.rs). Reads/writes raw bytes under the
 *    exact MIME-type names the legacy Qt Veusz uses
 *    (`text/x-vnd.veusz-widget-3`, `text/x-vnd.veusz-data-1`), and PNGs
 *    under the standard image type. Real OS clipboard: survives
 *    restarts, works across windows, best-effort cross-app interop.
 *  - `inMemoryClipboard()` — process-local, for vitest (no Tauri).
 *
 * The choice is made by `createClipboard()` at boot: real clipboard
 * if `window.__TAURI_INTERNALS__` is present, in-memory otherwise.
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
 * Real OS-clipboard backend via custom Tauri commands that go straight
 * to NSPasteboard (see src-tauri/src/clipboard.rs). Reads/writes raw
 * bytes under the exact MIME-type names the legacy Qt Veusz uses, so
 * copy/paste survives app restarts, works across windows, and gives
 * the best shot at cross-app interop. PNGs are written under the
 * standard image type so any app can paste the plot.
 *
 * Commands are invoked dynamically (via @tauri-apps/api/core) so vitest
 * — which has no Tauri runtime — never resolves the native side; it
 * uses inMemoryClipboard() instead (see createClipboard).
 */
export function tauriClipboard(): Clipboard {
  const IMAGE_MIME = 'image/png';

  async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
    const mod = '@tauri-apps/api/core';
    const core = await import(/* @vite-ignore */ mod);
    return (core.invoke as (c: string, a?: Record<string, unknown>) => Promise<T>)(cmd, args);
  }

  return {
    async write(p: ClipboardPayload) {
      if (p.mime_type === IMAGE_MIME) {
        await invoke('clipboard_write_image_png', { b64: p.payload_b64 });
        return;
      }
      await invoke('clipboard_write_mime', {
        mime: p.mime_type,
        b64: p.payload_b64,
      });
    },
    async read(acceptable: string[]) {
      for (const mime of acceptable) {
        const b64 = await invoke<string | null>('clipboard_read_mime', { mime });
        if (b64) return { mime_type: mime, payload_b64: b64 };
      }
      return null;
    },
    async has(acceptable: string[]) {
      for (const mime of acceptable) {
        if (await invoke<boolean>('clipboard_has_mime', { mime })) return true;
      }
      return false;
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
