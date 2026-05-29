import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CLI = join(HERE, 'veusz-embed.mjs');
const REPO = resolve(HERE, '..', '..');
const VSZ = join(REPO, 'examples', 'fit.vsz');
const VENV_PY = join(REPO, '.venv', 'bin', 'python');

describe('veusz-embed CLI (CDN mode)', () => {
  it('emits a tiny page referencing the CDN + copies the .vsz', () => {
    const out = mkdtempSync(join(tmpdir(), 'veusz-embed-'));
    execFileSync('node', [CLI, 'build', VSZ, '-o', out,
      '--cdn', 'https://cdn.example/ve', '--no-poster']);
    expect(existsSync(join(out, 'fit.vsz'))).toBe(true);
    const html = readFileSync(join(out, 'index.html'), 'utf-8');
    expect(html).toContain('<veusz-figure');
    expect(html).toContain('src="./fit.vsz"');
    expect(html).toContain('https://cdn.example/ve/veusz-embed.js');
    expect(html).toMatch(/veusz-wheel="https:\/\/cdn\.example\/ve\/veusz-[\d.]+-py3-none-any\.whl"/);
    // CDN mode must NOT vendor the bundle.
    expect(existsSync(join(out, 'veusz-embed.js'))).toBe(false);
    // --no-poster: no image referenced.
    expect(html).not.toContain('poster=');
  });

  it('defaults to the versioned Pages path matching the deploy workflow', () => {
    const out = mkdtempSync(join(tmpdir(), 'veusz-embed-'));
    const version = readFileSync(join(REPO, 'VERSION'), 'utf-8').trim();
    execFileSync('node', [CLI, 'build', VSZ, '-o', out, '--no-poster']);
    const html = readFileSync(join(out, 'index.html'), 'utf-8');
    const base = `https://yipihey.github.io/veusz/embed/v${version}`;
    expect(html).toContain(`${base}/veusz-embed.js`);
    expect(html).toContain(`wasm-base="${base}/wasm"`);
    expect(html).toContain(`veusz-wheel="${base}/veusz-${version}-py3-none-any.whl"`);
  });
});

describe('veusz-embed CLI (poster)', () => {
  it('copies an author-supplied --poster and wires it', () => {
    const out = mkdtempSync(join(tmpdir(), 'veusz-embed-'));
    const img = join(out, 'mine.png');
    writeFileSync(img, 'not-really-a-png');
    execFileSync('node', [CLI, 'build', VSZ, '-o', out,
      '--cdn', 'https://cdn.example/ve', '--poster', img]);
    expect(existsSync(join(out, 'fit.poster.png'))).toBe(true);
    const html = readFileSync(join(out, 'index.html'), 'utf-8');
    expect(html).toContain('poster="./fit.poster.png"');
    // Default (poster present, no --eager): boot is deferred — no eager attr.
    expect(html).not.toContain('eager=');
  });

  it('emits eager="true" with --eager', () => {
    const out = mkdtempSync(join(tmpdir(), 'veusz-embed-'));
    const img = join(out, 'mine.png');
    writeFileSync(img, 'not-really-a-png');
    execFileSync('node', [CLI, 'build', VSZ, '-o', out,
      '--cdn', 'https://cdn.example/ve', '--poster', img, '--eager']);
    expect(readFileSync(join(out, 'index.html'), 'utf-8')).toContain('eager="true"');
  });

  it.skipIf(!existsSync(VENV_PY))(
    'auto-generates a poster PNG via the headless renderer', () => {
      const out = mkdtempSync(join(tmpdir(), 'veusz-embed-'));
      execFileSync('node', [CLI, 'build', VSZ, '-o', out,
        '--cdn', 'https://cdn.example/ve', '--python', VENV_PY],
        { timeout: 120000 });
      expect(existsSync(join(out, 'fit.poster.png'))).toBe(true);
      expect(readFileSync(join(out, 'fit.poster.png')).length).toBeGreaterThan(1000);
      expect(readFileSync(join(out, 'index.html'), 'utf-8'))
        .toContain('poster="./fit.poster.png"');
    });
});
