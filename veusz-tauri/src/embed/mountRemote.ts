/**
 * Mount the Veusz editor against a **remote** daemon instead of an in-browser
 * Pyodide runtime. This is how a non-Python notebook host (IJulia, Pluto, …)
 * shows a live, editable figure: the host kernel runs `veuszd` as a subprocess,
 * relays JSON-RPC over a comm, and the editor here drives it like any other
 * transport. No Pyodide, no wheel — the document and data already live in the
 * daemon (the host built them).
 *
 * The whole editor stack (plot, tree, inspector, toolbar, colormap + dataset
 * pickers) is reused unchanged; only the transport differs. See
 * `commTransport` in ../rpc/transport.ts and the daemon protocol docs.
 */

import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { createRpc } from '../rpc/client';
import { createDocStore } from '../state/doc';
import { commTransport, type CommLike, type Transport } from '../rpc/transport';
import { VeuszFigure } from './VeuszFigure';

export interface RemoteEditorOptions {
  width?: number;
  height?: number;
  /** Show the Edit affordance (default true). */
  editable?: boolean;
  /** Open the editor immediately rather than the inline preview (default true
   *  — a live notebook widget wants the editor up). */
  initialEditing?: boolean;
  title?: string;
}

export interface RemoteEditorHandle {
  store: ReturnType<typeof createDocStore>;
  unmount(): void;
}

/**
 * Mount the editor into `container`, driving the daemon over `transport`
 * (typically `commTransport(comm)`). Returns the store + an `unmount()`.
 * The caller is responsible for the daemon already holding a document (the
 * host kernel built it and pushed data via `data.set_b64`).
 */
export function mountRemoteEditor(
  container: HTMLElement,
  transport: Transport,
  opts: RemoteEditorOptions = {},
): RemoteEditorHandle {
  const store = createDocStore(createRpc(transport));
  // Pull the current document/data/colormaps from the daemon, then render.
  void store.getState().refreshAll();
  const root: Root = createRoot(container);
  root.render(
    createElement(VeuszFigure, {
      store,
      width: opts.width ?? 600,
      height: opts.height ?? 400,
      editable: opts.editable ?? true,
      initialEditing: opts.initialEditing ?? true,
      title: opts.title,
    }),
  );
  return { store, unmount: () => root.unmount() };
}

/** Convenience: build a `commTransport` from a host comm and mount the editor. */
export function mountRemoteEditorFromComm(
  container: HTMLElement,
  comm: CommLike,
  opts: RemoteEditorOptions = {},
): RemoteEditorHandle {
  return mountRemoteEditor(container, commTransport(comm), opts);
}
