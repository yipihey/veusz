/**
 * End-to-end: spawn a real `veuszd` from Node, drive the full Phase-1
 * workflow through it, hand the daemon's actual response payloads to
 * the React components, and assert they render correctly.
 *
 * This is the closest we get to a Playwright run without a browser —
 * it proves the wire format, the schema extractor, and the Inspector
 * registry all line up against the live Python implementation.
 *
 * Skips cleanly if `veuszd` isn't on PATH so frontend-only CI stays
 * green.
 */

import { afterAll, beforeAll, describe, it, expect } from 'vitest';
import { render, screen, within, cleanup, waitFor, fireEvent } from '@testing-library/react';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { spawnDaemon, NodeRpcClient } from './node-rpc';
import { Inspector } from '../components/inspector/Inspector';
import { Tree } from '../components/tree/Tree';
import { DatasetPanel } from '../components/data/DatasetPanel';
import { PlotCanvas } from '../components/plot/PlotCanvas';
import { AppShell } from '../components/app/AppShell';
import { createRpc } from '../rpc/client';
import { clientTransport } from '../rpc/transport';
import { createDocStore } from '../state/doc';
import type {
  DataInfo, WidgetSchema, WidgetTreeNode, RenderResult,
} from '../rpc/types';

let daemon: Awaited<ReturnType<typeof spawnDaemon>> | null = null;
let client: NodeRpcClient | null = null;
let tmp: string | null = null;
let skipReason: string | null = null;

beforeAll(async () => {
  process.stderr.write('[e2e] beforeAll: spawning daemon\n');
  try {
    daemon = await spawnDaemon();
  } catch (e) {
    skipReason = `spawnDaemon threw: ${(e as Error).message}`;
    process.stderr.write(`[e2e] ${skipReason}\n`);
    return;
  }
  if (!daemon) {
    skipReason = 'veuszd not on PATH (frontend-only CI)';
    process.stderr.write(`[e2e] ${skipReason}\n`);
    return;
  }
  client = daemon.client;
  tmp = mkdtempSync(join(tmpdir(), 'veusz-e2e-'));
  process.stderr.write('[e2e] daemon ready\n');
}, 15000);

afterAll(async () => {
  if (daemon) await daemon.shutdown();
  if (tmp) rmSync(tmp, { recursive: true, force: true });
});

describe('live daemon: full Phase-1 loop', () => {
    it('CSV → import → tree → inspector → render', async () => {
      if (skipReason) { console.warn('SKIP:', skipReason); return; }
      if (!client || !tmp) throw new Error('client should be ready by now');

      // 1. Write a CSV and import it
      const csvPath = join(tmp, 'square.csv');
      writeFileSync(csvPath, 'x,y\n0,0\n1,1\n2,4\n3,9\n4,16\n5,25\n');
      const importR = await client.call<{ imported: string[] }>('data.import', {
        kind: 'csv', filename: csvPath,
      });
      expect(importR.imported.sort()).toEqual(['x', 'y']);

      // 2. Build the plot
      await client.call('doc.add', { parent: '/', type: 'page' });
      await client.call('doc.add', { parent: '/page1', type: 'graph' });
      await client.call('doc.add', { parent: '/page1/graph1', type: 'xy' });
      await client.call('doc.set', { ops: [
        { path: '/page1/graph1/xy1/xData', value: 'x' },
        { path: '/page1/graph1/xy1/yData', value: 'y' },
      ]});

      // 3. Pull the tree and render it through the React Tree component
      const tree = await client.call<WidgetTreeNode>('doc.tree');
      cleanup();
      render(<Tree root={tree} selected={['/page1/graph1/xy1']} onSelect={() => {}} />);
      expect(screen.getByTestId('tree-node-/page1/graph1/xy1')).toBeInTheDocument();
      expect(screen.getByTestId('tree-node-/page1/graph1/xy1').dataset.selected).toBe('true');

      // 4. Pull dataset list and render it through DatasetPanel
      const datasets = await client.call<DataInfo[]>('data.list');
      cleanup();
      render(<DatasetPanel datasets={datasets} selected={['x']} onSelect={() => {}} />);
      expect(screen.getByTestId('dataset-row-x')).toBeInTheDocument();
      expect(screen.getByTestId('dataset-row-y')).toBeInTheDocument();

      // 5. Pull the xy schema and render the Inspector with live values
      const schema = await client.call<WidgetSchema>('doc.schema', {
        widget_type: 'xy',
      });
      // Fetch current values for every setting at top level + first subgroup
      const collectPaths = (g: WidgetSchema | (WidgetSchema['subgroups'][number]), base: string): string[] => {
        const acc: string[] = [];
        for (const s of g.settings) acc.push(`${base}/${s.name}`);
        for (const sg of g.subgroups) acc.push(...collectPaths(sg, `${base}/${sg.name}`));
        return acc;
      };
      const paths = collectPaths(schema, '/page1/graph1/xy1');
      const values = await client.call<Record<string, unknown>>('doc.get', { paths });

      cleanup();
      render(
        <Inspector
          schema={schema}
          widgetPaths={['/page1/graph1/xy1']}
          values={values}
          datasets={datasets.map((d) => d.name)}
          onChange={() => {}}
        />,
      );
      // The xData picker should have the dataset list available
      const xRow = screen.getByTestId('row-xData');
      const listOptions = xRow.querySelector('datalist')?.querySelectorAll('option');
      expect(listOptions?.length).toBe(2);
      // The marker dropdown should be pre-populated from the live schema
      const marker = within(screen.getByTestId('row-marker')).getByTestId('setting-marker') as HTMLSelectElement;
      expect(marker.options.length).toBeGreaterThan(10);

      // 6. Render the plot through PlotCanvas
      const r = await client.call<RenderResult>('render.png', {
        page: 0, w: 400, h: 300, dpi: 96, antialias: false,
      });
      expect(r.png.length).toBeGreaterThan(100);
      expect(Object.keys(r.bounds)).toContain('/page1/graph1/xy1');

      cleanup();
      render(
        <PlotCanvas
          png={r.png}
          width={r.width}
          height={r.height}
          bounds={r.bounds}
          selected={['/page1/graph1/xy1']}
          onSelect={() => {}}
        />,
      );
      // PNG <img> should be set, selection overlay present
      expect(screen.getByTestId('plot-png')).toHaveAttribute(
        'src',
        expect.stringContaining(r.png.slice(0, 32)) as never,
      );
      expect(screen.getByTestId('overlay-selected-/page1/graph1/xy1')).toBeInTheDocument();
    }, 20000);

    it('edit via doc.set hits the daemon and changes the render', async () => {
      process.stderr.write('[e2e] test 2 starting\n');
      if (skipReason) { console.warn('SKIP:', skipReason); return; }
      if (!client) throw new Error('client should be ready by now');

      // The previous test already built /page1/graph1/xy1 with the
      // CSV data bound. Render → change marker → render → undo →
      // render. Deterministic mode means PNGs are pixel-identical.
      const before = await client.call<RenderResult>('render.png', {
        page: 0, w: 200, h: 150, antialias: false,
      });
      const beforeMarker = (await client.call<Record<string, unknown>>(
        'doc.get', { paths: ['/page1/graph1/xy1/marker'] }))['/page1/graph1/xy1/marker'];

      await client.call('doc.set', { ops: [
        { path: '/page1/graph1/xy1/marker', value: beforeMarker === 'square' ? 'circle' : 'square' },
      ]});
      const after = await client.call<RenderResult>('render.png', {
        page: 0, w: 200, h: 150, antialias: false,
      });
      expect(after.png).not.toBe(before.png);

      await client.call('doc.undo');
      const undone = await client.call<RenderResult>('render.png', {
        page: 0, w: 200, h: 150, antialias: false,
      });
      expect(undone.png).toBe(before.png);
      process.stderr.write('[e2e] test 2 done\n');
    }, 20000);

    it('AppShell against the live daemon — full pipeline through one component', async () => {
      if (skipReason) { console.warn('SKIP:', skipReason); return; }
      if (!client || !tmp) throw new Error('client should be ready by now');

      // Fresh daemon connection / store for this test so we don't
      // collide with the doc state from prior tests.
      const rpc = createRpc(clientTransport(client));
      const store = createDocStore(rpc);

      // happy-dom needs the rect stubbed so plot click coords map correctly.
      Element.prototype.getBoundingClientRect = function () {
        return { left: 0, top: 0, right: 600, bottom: 400, width: 600,
                 height: 400, x: 0, y: 0, toJSON() { return this; } } as DOMRect;
      };

      cleanup();
      render(<AppShell store={store} renderWidth={600} renderHeight={400} />);

      // Tree appears (page1/graph1/xy1 from earlier tests)
      await waitFor(() =>
        expect(screen.getByTestId('tree-node-/page1/graph1/xy1')).toBeInTheDocument(),
      );

      // Click the xy widget; inspector populates with the live xy schema
      fireEvent.click(screen.getByTestId('tree-node-/page1/graph1/xy1'));
      await waitFor(() => screen.getByTestId('inspector'));
      expect(screen.getByTestId('row-marker')).toBeInTheDocument();
      const markerSelect = within(screen.getByTestId('row-marker')).getByTestId(
        'setting-marker',
      ) as HTMLSelectElement;
      // The real daemon's marker vallist has 70+ entries
      expect(markerSelect.options.length).toBeGreaterThan(50);

      // Wait for the initial debounced render to land so we have a
      // baseline PNG to compare against after the edit + undo. Without
      // this the coalescing window (~33ms) means `render` may still be
      // null when we capture beforeRender.
      await waitFor(() => expect(store.getState().render?.png).toBeTruthy(),
        { timeout: 3000 });

      // Edit the marker via the inspector — this should fire doc.set
      // through the real daemon and re-render automatically.
      const beforeRender = store.getState().render?.png;
      fireEvent.change(markerSelect, { target: { value: 'triangle' } });
      await waitFor(() => {
        const after = store.getState().render?.png;
        expect(after).toBeDefined();
        expect(after).not.toBe(beforeRender);
      }, { timeout: 5000 });

      // Toolbar undo enables; clicking it reverts the marker and the PNG
      await waitFor(() => expect(screen.getByTestId('toolbar-undo')).not.toBeDisabled());
      fireEvent.click(screen.getByTestId('toolbar-undo'));
      await waitFor(() => {
        expect(store.getState().render?.png).toBe(beforeRender);
      }, { timeout: 5000 });
    }, 30000);

    it('toolbar backend switch re-renders live with a shared control state', async () => {
      if (skipReason) { console.warn('SKIP:', skipReason); return; }
      if (!client) throw new Error('client should be ready');

      // Probe whether a scene backend (tiny-skia) is available in this
      // runtime — requires the built _paint_ext extension. Skip cleanly
      // otherwise so environments without the Rust build stay green.
      try {
        await client.call<RenderResult>('render.png',
          { page: 0, w: 80, h: 60, backend: 'tiny-skia' });
      } catch (e) {
        console.warn('SKIP backend-switch: scene backend unavailable:',
          (e as Error).message);
        return;
      }

      const rpc = createRpc(clientTransport(client));
      const store = createDocStore(rpc);
      cleanup();
      render(<AppShell store={store} renderWidth={400} renderHeight={300} />);
      await waitFor(() =>
        expect(screen.getByTestId('tree-node-/page1/graph1/xy1')).toBeInTheDocument());

      // Establish a qt baseline (settingdb may carry a prior pref).
      await store.getState().setBackend('qt');
      await waitFor(() => expect(store.getState().render?.backend).toBe('qt'),
        { timeout: 5000 });
      const qtBounds = Object.keys(store.getState().render!.bounds).sort();
      const qtPng = store.getState().render!.png;

      // Flip to tiny-skia via the toolbar control.
      fireEvent.click(screen.getByTestId('backend-tiny-skia'));
      await waitFor(() =>
        expect(store.getState().render?.backend).toBe('tiny-skia'),
        { timeout: 5000 });

      // Shared control state: the selectable widget bounds tree is identical
      // regardless of which backend rasterised the pixels.
      const skBounds = Object.keys(store.getState().render!.bounds).sort();
      expect(skBounds).toEqual(qtBounds);
      // A different rasteriser produced different pixels (the switch did
      // real work, not a no-op).
      expect(store.getState().render!.png).not.toBe(qtPng);
      expect(screen.getByTestId('backend-tiny-skia'))
        .toHaveAttribute('aria-pressed', 'true');

      // Restore the default so we don't pollute settingdb for later runs.
      await store.getState().setBackend('qt');
    }, 30000);

    it('AppShell receives doc.changed push events from the live daemon', async () => {
      if (skipReason) { console.warn('SKIP:', skipReason); return; }
      if (!client) throw new Error('client should be ready');

      const rpc = createRpc(clientTransport(client));
      const store = createDocStore(rpc);

      // Subscribe BEFORE the mutation we want to observe
      const off = store.getState().subscribeToDaemon();
      await store.getState().refreshAll();
      const treeBefore = store.getState().tree;
      // Drive a mutation directly through the same client; the daemon's
      // notifier broadcasts to us as well.
      await client.call('doc.add', { parent: '/page1', type: 'graph' });
      // The subscription fires refreshTree asynchronously; wait until
      // the store reflects the new graph.
      await waitFor(() => {
        const tree = store.getState().tree;
        const page = tree?.children.find((c) => c.name === 'page1');
        // Original Phase-1 page1 already has a graph1 from earlier tests;
        // this fresh add lands as graph2.
        expect(page?.children.length).toBeGreaterThan(treeBefore?.children?.[0]?.children?.length ?? 0);
      }, { timeout: 3000 });
      off();
    }, 15000);
});
