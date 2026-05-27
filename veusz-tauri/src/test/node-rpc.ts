/**
 * Node-side JSON-RPC client over a Unix domain socket. Used by the
 * e2e tests to drive a real `veuszd` subprocess without going through
 * the Tauri shell (which needs a browser).
 *
 * Mirrors the Rust crate's wire protocol: LSP-style Content-Length
 * framing, multiplexed requests by id.
 */

import { Socket, createConnection } from 'node:net';
import { spawn, ChildProcess } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { existsSync, unlinkSync } from 'node:fs';
import { Buffer } from 'node:buffer';

interface Pending {
  resolve: (value: unknown) => void;
  reject: (e: Error) => void;
}

export class NodeRpcClient {
  private sock: Socket;
  private buf = Buffer.alloc(0);
  private nextId = 0;
  private pending = new Map<number, Pending>();
  private closed = false;

  constructor(sock: Socket) {
    this.sock = sock;
    sock.on('data', (chunk) => this.onData(chunk));
    sock.on('close', () => this.onClose());
    sock.on('error', () => this.onClose());
  }

  private onData(chunk: Buffer | string) {
    const b = typeof chunk === 'string' ? Buffer.from(chunk, 'utf-8') : chunk;
    this.buf = Buffer.concat([this.buf, b]);
    while (true) {
      const headerEnd = this.buf.indexOf('\r\n\r\n');
      if (headerEnd < 0) return;
      const headers = this.buf.slice(0, headerEnd).toString('ascii');
      const m = /Content-Length: (\d+)/i.exec(headers);
      if (!m) throw new Error(`bad framing: ${headers}`);
      const len = Number(m[1]);
      const total = headerEnd + 4 + len;
      if (this.buf.length < total) return; // need more bytes
      const body = this.buf.slice(headerEnd + 4, total);
      this.buf = this.buf.slice(total);
      const msg = JSON.parse(body.toString('utf-8'));
      const id = msg.id as number | undefined;
      if (typeof id !== 'number') continue;
      const p = this.pending.get(id);
      if (!p) continue;
      this.pending.delete(id);
      if (msg.error) p.reject(new Error(`${msg.error.code}: ${msg.error.message}`));
      else p.resolve(msg.result);
    }
  }

  private onClose() {
    this.closed = true;
    for (const p of this.pending.values()) p.reject(new Error('connection closed'));
    this.pending.clear();
  }

  call<T = unknown>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    if (this.closed) return Promise.reject(new Error('client closed'));
    const id = ++this.nextId;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
      const body = JSON.stringify({ jsonrpc: '2.0', id, method, params });
      const frame = `Content-Length: ${Buffer.byteLength(body, 'utf-8')}\r\n\r\n${body}`;
      this.sock.write(frame);
    });
  }

  close() {
    this.sock.destroy();
  }
}

export interface SpawnedDaemon {
  client: NodeRpcClient;
  shutdown: () => Promise<void>;
}

/**
 * Spawn a `veuszd` subprocess, wait for the socket, return an RPC client.
 * Skip the whole test cleanly if `veuszd` isn't on PATH (e.g. CI runs
 * the frontend tests without the Python side installed).
 */
export async function spawnDaemon(): Promise<SpawnedDaemon | null> {
  const sock = join(tmpdir(), `veuszd-test-${process.pid}-${Date.now()}.sock`);
  if (existsSync(sock)) unlinkSync(sock);

  let child: ChildProcess;
  try {
    child = spawn('veuszd', ['--socket', sock, '--deterministic'], {
      stdio: ['ignore', 'ignore', 'pipe'],
      env: { ...process.env, QT_QPA_PLATFORM: 'offscreen' },
    });
    child.stderr?.on('data', (b) => {
      if (process.env.VEUSZD_DEBUG) process.stderr.write(b);
    });
  } catch (e) {
    if (process.env.VEUSZD_DEBUG) console.error('spawn failed:', e);
    return null;
  }

  // Wait for the socket to appear (up to 5s)
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    if (existsSync(sock)) break;
    await new Promise((r) => setTimeout(r, 25));
  }
  if (!existsSync(sock)) {
    child.kill('SIGKILL');
    return null;
  }

  // Connect; retry briefly because the bind→listen→accept race lets
  // existsSync(sock) win before the server is ready.
  let conn: Socket | null = null;
  for (let i = 0; i < 50; i++) {
    try {
      conn = await new Promise<Socket>((resolve, reject) => {
        const c = createConnection({ path: sock });
        c.once('connect', () => resolve(c));
        c.once('error', reject);
      });
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 25));
    }
  }
  if (!conn) {
    child.kill('SIGKILL');
    return null;
  }

  const client = new NodeRpcClient(conn);
  // Sanity ping
  await client.call('ping');

  return {
    client,
    shutdown: async () => {
      try { await client.call('shutdown'); } catch { /* expected on race */ }
      client.close();
      await new Promise<void>((r) => {
        if (child.exitCode != null) { r(); return; }
        const timer = setTimeout(() => { child.kill('SIGKILL'); r(); }, 2000);
        child.once('exit', () => { clearTimeout(timer); r(); });
      });
      if (existsSync(sock)) try { unlinkSync(sock); } catch { /* race */ }
    },
  };
}
