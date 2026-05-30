import { describe, it, expect, vi } from 'vitest';
import { extractDataFileNames, fetchDataFiles } from './localData';

describe('extractDataFileNames', () => {
  it('pulls relative file args from Import* calls, skipping URLs and non-files', () => {
    const vsz = [
      "ImportFile('spectrum.dat', 'x,y')",
      "ImportFileCSV(u'data.csv', linked=True)",                    // u'' Python literal
      "ImportFile2D('grid.dat', ['z'])",
      "ImportFileURL(u'https://example.com/live.csv', linked=True)", // URL → skip
      "ImportString('inlineds', '1 2 3')",                          // not a file → skip
      "ImportFile('spectrum.dat')",                                 // dup → once
    ].join('\n');
    expect(extractDataFileNames(vsz).sort()).toEqual(['data.csv', 'grid.dat', 'spectrum.dat']);
  });

  it('returns nothing for a self-contained document', () => {
    expect(extractDataFileNames("SetData('x', [1,2,3])\nAdd('graph')")).toEqual([]);
  });
});

describe('fetchDataFiles', () => {
  it('fetches each referenced file relative to the .vsz and skips missing ones', async () => {
    const seen: string[] = [];
    const doFetch = vi.fn(async (u: string) => {
      seen.push(u);
      if (u.endsWith('missing.dat')) return { ok: false } as Response;
      return {
        ok: true,
        arrayBuffer: async () => new TextEncoder().encode('1 2\n3 4').buffer,
      } as Response;
    });
    const vsz = "ImportFile('spectrum.dat')\nImportFileCSV('missing.dat')";
    const files = await fetchDataFiles(vsz, 'plots/sin.vsz', {}, doFetch as unknown as typeof fetch);

    expect(seen).toContain('http://localhost:3000/plots/spectrum.dat');
    expect(files).toHaveLength(1);
    expect(files[0].name).toBe('spectrum.dat');
    expect(new TextDecoder().decode(files[0].bytes)).toBe('1 2\n3 4');
  });

  it('honours a urlMap override', async () => {
    const doFetch = vi.fn(async () => ({
      ok: true, arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
    } as Response));
    await fetchDataFiles("ImportFile('a.dat')", 'x/y.vsz',
      { urlMap: { 'a.dat': 'https://cdn/x.dat' } }, doFetch as unknown as typeof fetch);
    expect(doFetch).toHaveBeenCalledWith('https://cdn/x.dat');
  });
});
