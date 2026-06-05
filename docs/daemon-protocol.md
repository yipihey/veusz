# The Veusz daemon protocol

`veuszd` is a headless [JSON-RPC 2.0](https://www.jsonrpc.org/specification)
server that exposes the full Veusz document model — build a figure, push data,
style it, render to vector/raster, save `.vsz`, export PDF/SVG/PNG — over a
socket. It is the **language-agnostic contract** behind every Veusz frontend:
the Tauri desktop app (Rust), the in-browser embed (TypeScript over Pyodide),
the Jupyter notebook widget (Python, in-process), and any future client
(Veusz.jl, Go, Swift). This document is the reference for writing a new client.

The compute is Python, but a client needs no Python: it speaks framed JSON over
a socket. The headless wheel runs the daemon with **no Qt build** (`pip install`
the pure-Python wheel, then `veuszd` / `python -m veusz.daemon.cli`).

- **Protocol version:** `1` (the `api` field of `version`). Bumped on
  incompatible changes.

## Transport

Default is a **Unix domain socket** (one client at a time, the v1 contract);
file permissions (`0o600`) gate access.

```
veuszd --socket /tmp/veuszd.sock                 # UDS (default)
python -m veusz.daemon.cli --socket /tmp/v.sock  # same, no console script needed
```

An optional **TCP** listener is available for hosts where a Unix socket is
awkward (Windows, sandboxes). It is gated by a shared token: the first framed
message on a TCP connection must be an `auth` request.

```
veuszd --tcp 127.0.0.1:0 --token <secret>        # 0 = ephemeral port (read it from the log)
```

Spawn-and-connect handshake (what a client does): start the process, poll for
the socket to exist, then connect with a few retries. Reference spawners:
`veusz-tauri/src/test/node-rpc.ts` (Node) and `tests/daemon/conftest.py`
(Python).

## Framing

LSP/DAP-style `Content-Length` framing — a header, a blank line, then exactly
that many bytes of UTF-8 JSON:

```
Content-Length: 52\r\n
\r\n
{"jsonrpc":"2.0","id":1,"method":"ping","params":{}}
```

Max body size is 64 MiB. See `veusz/daemon/framing.py`.

## Envelopes

**Request** (client → server):
```json
{"jsonrpc": "2.0", "id": 1, "method": "doc.add", "params": {"parent": "/", "type": "page"}}
```
`params` may be an object (keyword args) or an array (positional). Omit `id`
for a fire-and-forget request (no reply is sent).

**Response** (server → client), one of:
```json
{"jsonrpc": "2.0", "id": 1, "result": {"path": "/page1"}}
{"jsonrpc": "2.0", "id": 1, "error": {"code": -32602, "message": "...", "data": {...}}}
```

**Notification** (server → client, unsolicited push, **no `id`**):
```json
{"jsonrpc": "2.0", "method": "doc.changed", "params": {"changeset": 3, "kind": "add", "paths": ["/page1"]}}
```

A client demultiplexes by: has `id` → a reply (settle the matching request);
has `method`, no `id` → a notification (fan out to subscribers).

### Error codes (`veusz/daemon/errors.py`)

| code | meaning |
|------|---------|
| `-32700` | parse error (malformed JSON) |
| `-32600` | invalid request (missing/wrong `jsonrpc`/`method`) |
| `-32601` | method not found |
| `-32602` | invalid params (bad args, or a handler `RpcError`) |
| `-32603` | internal error (unhandled exception; `data.traceback` included) |

## Notifications

Subscribe to react to document/data mutations (drives reactive UIs).

| method | when | params |
|--------|------|--------|
| `doc.changed` | any document mutation | `{changeset, kind, paths}` — `kind` ∈ add/set/remove/rename/move/duplicate/undo/redo/load/new/customs/propagate/plugin |
| `data.changed` | any dataset mutation | `{names, kind}` — `kind` ∈ set/create/import/filter/tag/untag/rename/delete/paste/reload_file/reload_url/unlink/plugin/wipe |

## Method catalog

A flat namespace of dotted names (`veusz/daemon/handlers/`). The essentials for
building and exporting a figure:

**core** — `ping`, `version` (`{veusz, api}`), `shutdown`.

**doc** — the widget tree & settings: `tree`, `new(mode)`, `add(parent,type,name?)`,
`remove`, `rename`, `move(direction)`, `duplicate`, `set(ops=[{path,value}] | path,value)`,
`get(paths)`, `undo`/`redo`/`can_undo`, `insert_targets(path)`, `schema_at(path)`,
`schema(widget_type)`, `widget_types`, `colormaps(samples?)`, `serialize_widgets`/
`paste_widgets_mime`/`can_paste_mime`, `common_schema(paths)`, `get_customs`/`set_customs`,
`propagate_setting`/`reset_setting_default`/`unlink_setting`.

**data** — datasets: `list`, `peek(name)`, `stats(name)`, `set(name,values,dtype?)`
(JSON list), **`set_b64(name,b64,shape?,dtype?)`** (binary — see below),
`create`/`create_2d`, `filter`, `histogram`, `import(kind,filename)`,
`delete`/`rename`/`duplicate`, `tag`/`untag`, `serialize`/`paste_mime`.

**file** — `open(path)`, `save`/`save_as(path)` (writes a `.vsz`), `info`,
`export(path,pages,options?)` (PDF/SVG/PNG/EPS/PS), `formats`, recent-files.

**render** — `scene(page,w,h,dpi)` → `{scene_b64, width, height, bounds}` (the
abstract Scene-IR the WASM frontend rasterises), `svg(...)`, `png(...)`,
`pixel_to_data`, `copy_image`.

**eval/fit/state/prefs/plugins** — `eval.python`, `fit.run`, `state.snapshot`/
`restore`, `prefs.{get,set,delete,list}`, `plugins.{list,run}`.

### Pushing arrays: `data.set` vs `data.set_b64`

- `data.set(name, values, dtype='float64')` — `values` is a JSON list. Fine for
  small/typed data; O(n) and bulky for large arrays.
- `data.set_b64(name, b64, shape?, dtype='float64')` — `b64` is base64 of a
  little-endian binary buffer. `dtype` names the **wire** element type
  (`float64`/`float32`/`int64`/`int32`); the dataset is stored as float64.
  `shape: [rows, cols]` makes it a 2-D dataset. This is the efficient
  large-array path for any-language clients.

  ```python
  import base64, numpy as np
  buf = np.ascontiguousarray(x, dtype='<f8').tobytes()
  call("data.set_b64", {"name": "x", "b64": base64.b64encode(buf).decode(), "dtype": "float64"})
  ```

## Worked example

```text
spawn:  veuszd --socket /tmp/v.sock
→ ping                                                  ← {pong: true}
→ version                                               ← {veusz: "...", api: 1}
→ doc.new        {mode: "graph"}
→ data.set_b64   {name: "x", b64: <…>, dtype: "float64"}
→ data.set_b64   {name: "y", b64: <…>, dtype: "float64"}
→ doc.add        {parent: "/page1/graph1", type: "xy"}  ← {path: "/page1/graph1/xy1"}
→ doc.set        {ops: [{path: "/page1/graph1/xy1/xData", value: "x"},
                        {path: "/page1/graph1/xy1/yData", value: "y"}]}
→ render.svg     {page: 0, w: 600, h: 400, dpi: 96}     ← {svg: "<svg …>"}
→ file.save_as   {path: "/tmp/fig.vsz"}                 ← {ok: true, path: "/tmp/fig.vsz"}
→ file.export    {path: "/tmp/fig.pdf", pages: [0]}     ← {ok: true}
→ shutdown
```

## Editable interactive HTML export

A figure exports to an **editable, interactive** browser artifact with no
server — two files:

1. `file.save_as("figure.vsz")` — the `.vsz` embeds its datasets as
   `ImportString(...)` literals, so it is self-contained.
2. An `index.html` that mounts the in-browser embed against that `.vsz`:

```html
<script type="module"
        src="https://yipihey.github.io/veusz/embed/v<VERSION>/veusz-embed.js"></script>
<veusz-figure src="./figure.vsz" width="700" height="500"></veusz-figure>
```

The embed boots Veusz in Pyodide (WASM) and renders the Scene-IR via the Rust
renderer; the reader can zoom, edit settings, and export. For offline/bundled
output (vendoring the JS + wasm + wheel, or a single self-contained HTML), use
`veusz-tauri/scripts/veusz-embed.mjs` (`--bundle`, `--self-contained`).

## Live notebook widgets (any host)

A notebook kernel that can host a comm (IJulia, IPython, Pluto…) mounts the
**same** editor without Pyodide: the kernel runs `veuszd` as a subprocess and
relays JSON-RPC over the comm; the browser-side editor drives it via
`commTransport`. See `veusz-tauri/src/rpc/transport.ts` (`commTransport`) and
`veusz-tauri/src/embed/mountRemote.ts` (`mountRemoteEditorFromComm`), both
exported from the embed bundle. The kernel relay is a passthrough: each
`{id, method, params}` from the comm → daemon; each `{id, result|error}` and
each `{method, params}` notification back to the comm.

## Adding a new language client

The whole client is ~200–400 LOC:

1. **Connect** — spawn `veuszd` (or connect to a running one); for TCP, send the
   `auth` request first.
2. **Frame** — read/write `Content-Length`-framed UTF-8 JSON.
3. **Multiplex** — a monotonic `id` per request; a map `id → future`; a
   background reader that routes replies (have `id`) to their future and
   notifications (no `id`) to per-method subscribers.
4. **Wrap** — optional idiomatic API (`figure()`, `plot!`, `set!`) and inline
   display via `render.svg`/`render.png`.

Reference clients to copy from:
- **Python** — `tests/daemon/conftest.py` (`_Client`)
- **TypeScript** — `veusz-tauri/src/test/node-rpc.ts`
- **Rust** — `veusz-tauri/crates/veusz-rpc/src/lib.rs`
