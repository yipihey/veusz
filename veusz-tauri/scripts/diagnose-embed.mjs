#!/usr/bin/env node
/**
 * Drive an embed page through headless Chromium and dump everything to stdout
 * — console messages (with their source URL + line), uncaught errors, the
 * <veusz-figure>'s status badge, and a screenshot. So errors that show up as
 * `{}` in the browser console come out as real text here, and you don't have
 * to copy/paste anything from devtools.
 *
 * Default URL: the dev server's embed page. Override with `--url`.
 *
 *   pnpm exec node scripts/diagnose-embed.mjs
 *   pnpm exec node scripts/diagnose-embed.mjs --url file:///tmp/fit_single.html
 *
 * Note: Playwright's bundled Chromium enables WebGPU via SwiftShader on
 * macOS, so the page actually attempts to render (rather than degrading on a
 * missing GPU adapter). Real-GPU rendering still needs your normal browser.
 */

import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';

function parseArgs(argv) {
  const a = { url: 'http://localhost:5173/embed.html', timeout: 60_000,
              screenshot: '/tmp/embed-diagnose.png', wait: 'load' };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === '--url') a.url = argv[++i];
    else if (t === '--timeout') a.timeout = Number(argv[++i]);
    else if (t === '--screenshot') a.screenshot = argv[++i];
    else if (t === '--wait') a.wait = argv[++i];        // 'load' | 'ready' | 'rendered' | seconds-as-string
  }
  return a;
}

const args = parseArgs(process.argv.slice(2));

const browser = await chromium.launch({
  args: ['--enable-unsafe-webgpu', '--enable-features=Vulkan'],
});
const ctx = await browser.newContext();
const page = await ctx.newPage();

const events = [];
const log = (kind, payload) => {
  events.push({ kind, t: Date.now(), ...payload });
  const tag = kind.padEnd(10);
  console.log(`[${tag}] ${JSON.stringify(payload)}`);
};

page.on('console', (msg) => {
  // Skip noisy benign messages; promote everything else.
  const text = msg.text();
  const loc = msg.location();
  log(msg.type(), { text, url: loc.url, line: loc.lineNumber, col: loc.columnNumber });
});
page.on('pageerror', (err) => {
  log('pageerror', { message: err.message, stack: err.stack });
});
page.on('requestfailed', (req) => {
  log('netfail', { url: req.url(), method: req.method(),
                   failure: req.failure()?.errorText });
});
page.on('response', async (resp) => {
  if (resp.status() >= 400) {
    log('http-error', { url: resp.url(), status: resp.status(), statusText: resp.statusText() });
  }
});

try {
  console.log(`navigating: ${args.url}`);
  await page.goto(args.url, { waitUntil: 'load', timeout: args.timeout });

  // For the dev page, poll the <veusz-figure> status badge so we capture the
  // outcome rather than just the load event. For self-contained / static
  // figures the badge id is `status` directly.
  const status = await page.evaluate(() => {
    const fig = document.querySelector('veusz-figure');
    const inner = fig?.shadowRoot?.querySelector('[data-testid="veusz-figure-status"]')
                || document.querySelector('[data-testid="veusz-figure-status"]')
                || document.querySelector('#status');
    return { text: inner?.textContent?.trim() || null,
             hasFigure: !!fig,
             webgpu: 'gpu' in (globalThis.navigator || {}) };
  });
  log('figure-status', status);

  // Poll the figure's status badge until it reaches a terminal state
  // (rendered / error / WebGPU missing) or `args.timeout` expires. That's
  // what catches the actual runtime error you'd otherwise miss with a
  // fixed wait — Pyodide takes ~10–30 s to boot before scene rendering.
  const terminalRe = /Rendered|render failed|WebGPU|Failed/i;
  const maxMs = Math.max(args.timeout, 60_000);
  const tStart = Date.now();
  let after = null;
  while (Date.now() - tStart < maxMs) {
    after = await page.evaluate(() => {
      const inner = document.querySelector('[data-testid="veusz-figure-status"]')
                  || document.querySelector('#status');
      return inner?.textContent?.trim() || null;
    });
    if (after && terminalRe.test(after)) break;
    await page.waitForTimeout(500);
  }
  log('figure-status-after', { text: after, waited_ms: Date.now() - tStart });

  await page.screenshot({ path: args.screenshot, fullPage: true });
  console.log(`screenshot -> ${args.screenshot}`);

  writeFileSync('/tmp/embed-diagnose.json', JSON.stringify(events, null, 2));
  console.log('events -> /tmp/embed-diagnose.json');
} catch (e) {
  console.error('diagnose failed:', e?.message || String(e));
  if (e?.stack) console.error(e.stack);
  process.exitCode = 1;
} finally {
  await browser.close();
}
