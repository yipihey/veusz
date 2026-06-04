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
  for (const k of ['width', 'height', 'cdn', 'poster', 'alt', 'eager', 'static', 'embed']) {
    assert.ok(veuszDirective.options[k], `option ${k} should exist`);
  }
  assert.equal(veuszDirective.options.width.type, String);
  assert.equal(veuszDirective.options.eager.type, Boolean);
  assert.equal(veuszDirective.options.static.type, Boolean);
  assert.equal(veuszDirective.options.embed.type, Boolean);
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

test('buildViewerUrl resolves a relative poster against the .vsz, not the viewer', () => {
  // The poster lives next to the document; the viewer runs from the embed CDN.
  // A bare relative poster would resolve against the CDN and 404 (and on a
  // no-WebGPU browser, fall through to a "needs WebGPU" message).
  const url = buildViewerUrl({
    src: 'https://h/notebook/phase.vsz',
    cdn: 'https://h/embed/v4.5.0/',
    poster: 'figures/phase.svg',
  });
  assert.equal(
    new URL(url).searchParams.get('poster'),
    'https://h/notebook/figures/phase.svg',
  );
  // An already-absolute poster is left as-is.
  const abs = buildViewerUrl({
    src: 'https://h/notebook/phase.vsz',
    cdn: 'https://h/embed/v4.5.0/',
    poster: 'https://cdn.example/p.svg',
  });
  assert.equal(new URL(abs).searchParams.get('poster'), 'https://cdn.example/p.svg');
});

test('run() default: a clickable poster + a CTA link to the viewer', () => {
  const vfile = makeVfile();
  const nodes = veuszDirective.run(
    {
      arg: 'https://h/notebook/phase.vsz',
      options: { width: '700', height: '500', poster: 'phase.svg' },
    },
    vfile,
  );
  // paragraph[link[image]] + paragraph[link[text]]
  assert.equal(nodes.length, 2);
  const posterLink = nodes[0].children[0];
  assert.equal(nodes[0].type, 'paragraph');
  assert.equal(posterLink.type, 'link');
  assert.ok(posterLink.url.includes('/figure.html?'));
  const image = posterLink.children[0];
  assert.equal(image.type, 'image');
  assert.equal(image.url, 'phase.svg'); // the inline poster IS the figure
  assert.equal(image.width, '700');

  const cta = nodes[1].children[0];
  assert.equal(cta.type, 'link');
  assert.equal(cta.children[0].value, '⤢ Open interactive figure');
  const q = new URL(cta.url).searchParams;
  assert.equal(q.get('src'), 'https://h/notebook/phase.vsz');
  assert.equal(vfile.messages.length, 0); // happy path: no warnings
});

test('run() with :embed: emits the inline iframe (opt-in)', () => {
  const nodes = veuszDirective.run({
    arg: 'https://h/notebook/phase.vsz',
    options: { width: '700', height: '500', poster: 'phase.svg', embed: true },
  });
  assert.equal(nodes.length, 1);
  const [iframe] = nodes;
  assert.equal(iframe.type, 'iframe');
  assert.ok(iframe.src.includes('/figure.html?'));
  assert.equal(iframe.width, '700');
  assert.equal(iframe.height, '500');
});

test('run() with no :poster: emits only the CTA link (no broken image)', () => {
  const vfile = makeVfile();
  const nodes = veuszDirective.run({ arg: 'a.vsz', options: {} }, vfile);
  assert.equal(nodes.length, 1);
  assert.equal(nodes[0].children[0].type, 'link');
  assert.ok(vfile.messages.some((m) => /poster/.test(m)));
});

test('run() uses the default CDN when none is given, overridable via :cdn:', () => {
  const def = veuszDirective.run({ arg: 'x.vsz', options: { poster: 'x.svg' } });
  assert.ok(def[0].children[0].url.startsWith(DEFAULTS.cdn));
  const over = veuszDirective.run({
    arg: 'x.vsz',
    options: { poster: 'x.svg', cdn: 'https://my/embed/v9' },
  });
  assert.ok(over[0].children[0].url.startsWith('https://my/embed/v9/figure.html?'));
});

test('run() honours :eager: as a query flag', () => {
  const nodes = veuszDirective.run({
    arg: 'a.vsz',
    options: { poster: 'a.svg', eager: true },
  });
  assert.equal(new URL(nodes[0].children[0].url).searchParams.get('eager'), '1');
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
