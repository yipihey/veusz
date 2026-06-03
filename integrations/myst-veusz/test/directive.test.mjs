import { test } from 'node:test';
import assert from 'node:assert/strict';

import plugin, {
  veuszDirective,
  buildVeuszFigureHtml,
  buildPosterImageNode,
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
  for (const k of ['width', 'height', 'poster', 'alt', 'eager', 'static']) {
    assert.ok(veuszDirective.options[k], `option ${k} should exist`);
  }
  assert.equal(veuszDirective.options.width.type, String);
  assert.equal(veuszDirective.options.eager.type, Boolean);
  assert.equal(veuszDirective.options.static.type, Boolean);
});

test('run() returns [html web component, image poster] by default', () => {
  const vfile = makeVfile();
  const nodes = veuszDirective.run(
    {
      arg: 'figures/phase.vsz',
      options: { width: '700', height: '500', poster: 'figures/phase.png' },
    },
    vfile,
  );

  assert.equal(nodes.length, 2);

  const [html, image] = nodes;

  // 1) Live web component (HTML output)
  assert.equal(html.type, 'html');
  assert.match(html.value, /<veusz-figure\b/);
  assert.match(html.value, /src="figures\/phase\.vsz"/);
  assert.match(html.value, /width="700"/);
  assert.match(html.value, /height="500"/);
  assert.match(html.value, /poster="figures\/phase\.png"/);
  // poster also embedded as graceful fallback <img> inside the component
  assert.match(html.value, /<img src="figures\/phase\.png"/);

  // 2) Static poster image (PDF / Typst / LaTeX export fallback)
  assert.equal(image.type, 'image');
  assert.equal(image.url, 'figures/phase.png');
  assert.equal(image.width, '700');
  assert.equal(image.height, '500');

  // no warnings on the happy path
  assert.equal(vfile.messages.length, 0);
});

test('run() honours :eager: as a boolean attribute', () => {
  const nodes = veuszDirective.run({
    arg: 'a.vsz',
    options: { poster: 'a.png', eager: true },
  });
  const html = nodes.find((n) => n.type === 'html');
  assert.match(html.value, /<veusz-figure[^>]*\beager\b/);
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

test('run() warns when no poster is provided (export has no static image)', () => {
  const vfile = makeVfile();
  const nodes = veuszDirective.run({ arg: 'a.vsz', options: {} }, vfile);
  // image still emitted, falling back to the src url
  const image = nodes.find((n) => n.type === 'image');
  assert.equal(image.url, 'a.vsz');
  assert.ok(
    vfile.messages.some((m) => /poster/.test(m)),
    'should warn about missing poster',
  );
});

test('run() with no arg returns [] and reports an error', () => {
  const vfile = makeVfile();
  const nodes = veuszDirective.run({ arg: undefined, options: {} }, vfile);
  assert.deepEqual(nodes, []);
  assert.ok(vfile.messages.some((m) => /required/.test(m)));
});

test('buildVeuszFigureHtml escapes attribute values', () => {
  const html = buildVeuszFigureHtml({
    src: 'a"b.vsz',
    poster: 'p&q.png',
  });
  assert.match(html, /src="a&quot;b\.vsz"/);
  assert.match(html, /poster="p&amp;q\.png"/);
  // no raw unescaped quote breaking out of the attribute
  assert.ok(!html.includes('src="a"b.vsz"'));
});

test('buildPosterImageNode falls back to src when no poster', () => {
  const node = buildPosterImageNode({ src: 'only.vsz' });
  assert.equal(node.type, 'image');
  assert.equal(node.url, 'only.vsz');
});
