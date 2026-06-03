import { test } from 'node:test';
import assert from 'node:assert/strict';

import plugin, {
  veuszDirective,
  buildViewerUrl,
  buildPosterImageNode,
  DEFAULTS,
} from '../src/index.mjs';

/** Minimal vfile stub that records messages. */
function makeVfile() {
  const messages = [];
  return { messages, message: (m) => messages.push(m) };
}

test('plugin shape: name + one directive named "veusz"', () => {
  assert.equal(plugin.name, 'Veusz interactive figures');
  assert.ok(Array.isArray(plugin.directives));
  assert.equal(plugin.directives.length, 1);
  assert.equal(plugin.directives[0].name, 'veusz');
  assert.deepEqual(plugin.directives[0].alias, ['veusz-figure']);
});

test('directive spec: required String arg + expected options', () => {
  assert.equal(veuszDirective.arg.type, String);
  assert.equal(veuszDirective.arg.required, true);
  for (const k of ['width', 'height', 'cdn', 'poster', 'alt', 'eager', 'static']) {
    assert.ok(veuszDirective.options[k], `option ${k} should exist`);
  }
  assert.equal(veuszDirective.options.width.type, String);
  assert.equal(veuszDirective.options.eager.type, Boolean);
  assert.equal(veuszDirective.options.static.type, Boolean);
});

test('buildViewerUrl encodes src + size into figure.html query', () => {
  const url = buildViewerUrl({
    src: 'https://h/notebook/phase.vsz',
    cdn: 'https://h/embed/v4.5.0/',
    width: '720',
    height: '520',
  });
  assert.ok(url.startsWith('https://h/embed/v4.5.0/figure.html?'));
  const q = new URL(url).searchParams;
  assert.equal(q.get('src'), 'https://h/notebook/phase.vsz');
  assert.equal(q.get('width'), '720');
  assert.equal(q.get('height'), '520');
});

test('run() emits an iframe to the viewer by default', () => {
  const vfile = makeVfile();
  const nodes = veuszDirective.run(
    {
      arg: 'https://h/notebook/phase.vsz',
      options: { width: '700', height: '500', poster: 'phase.png' },
    },
    vfile,
  );
  assert.equal(nodes.length, 1);
  const [iframe] = nodes;
  assert.equal(iframe.type, 'iframe');
  assert.ok(iframe.src.includes('/figure.html?'));
  const q = new URL(iframe.src).searchParams;
  assert.equal(q.get('src'), 'https://h/notebook/phase.vsz');
  assert.equal(q.get('poster'), 'phase.png');
  assert.equal(iframe.width, '700');
  assert.equal(iframe.height, '500');
  // happy path: no warnings
  assert.equal(vfile.messages.length, 0);
});

test('run() uses the default CDN when none is given, overridable via :cdn:', () => {
  const def = veuszDirective.run({ arg: 'x.vsz', options: { poster: 'x.png' } });
  assert.ok(def[0].src.startsWith(DEFAULTS.cdn));
  const over = veuszDirective.run({
    arg: 'x.vsz',
    options: { poster: 'x.png', cdn: 'https://my/embed/v9' },
  });
  assert.ok(over[0].src.startsWith('https://my/embed/v9/figure.html?'));
});

test('run() honours :eager: as a query flag', () => {
  const [iframe] = veuszDirective.run({
    arg: 'a.vsz',
    options: { poster: 'a.png', eager: true },
  });
  assert.equal(new URL(iframe.src).searchParams.get('eager'), '1');
});

test('run() with :static: emits ONLY the poster image (export-safe)', () => {
  const nodes = veuszDirective.run({
    arg: 'a.vsz',
    options: { poster: 'a.png', width: '640', static: true },
  });
  assert.equal(nodes.length, 1);
  assert.equal(nodes[0].type, 'image');
  assert.equal(nodes[0].url, 'a.png');
  assert.equal(nodes[0].width, '640');
});

test('run() warns when no poster is provided', () => {
  const vfile = makeVfile();
  const nodes = veuszDirective.run({ arg: 'a.vsz', options: {} }, vfile);
  assert.equal(nodes[0].type, 'iframe');
  assert.ok(vfile.messages.some((m) => /poster/.test(m)), 'should warn about missing poster');
});

test('run() with no arg returns [] and reports an error', () => {
  const vfile = makeVfile();
  const nodes = veuszDirective.run({ arg: undefined, options: {} }, vfile);
  assert.deepEqual(nodes, []);
  assert.ok(vfile.messages.some((m) => /required/.test(m)));
});

test('buildPosterImageNode falls back to src when no poster', () => {
  const node = buildPosterImageNode({ src: 'only.vsz' });
  assert.equal(node.type, 'image');
  assert.equal(node.url, 'only.vsz');
});
