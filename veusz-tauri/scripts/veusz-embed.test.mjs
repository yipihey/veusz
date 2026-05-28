import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CLI = join(HERE, 'veusz-embed.mjs');
const VSZ = resolve(HERE, '..', '..', 'examples', 'fit.vsz');

describe('veusz-embed CLI (CDN mode)', () => {
  it('emits a tiny page referencing the CDN + copies the .vsz', () => {
    const out = mkdtempSync(join(tmpdir(), 'veusz-embed-'));
    execFileSync('node', [CLI, 'build', VSZ, '-o', out, '--cdn', 'https://cdn.example/ve']);
    expect(existsSync(join(out, 'fit.vsz'))).toBe(true);
    const html = readFileSync(join(out, 'index.html'), 'utf-8');
    expect(html).toContain('<veusz-figure');
    expect(html).toContain('src="./fit.vsz"');
    expect(html).toContain('https://cdn.example/ve/veusz-embed.js');
    expect(html).toMatch(/veusz-wheel="https:\/\/cdn\.example\/ve\/veusz-[\d.]+-py3-none-any\.whl"/);
    // CDN mode must NOT vendor the bundle.
    expect(existsSync(join(out, 'veusz-embed.js'))).toBe(false);
  });
});
