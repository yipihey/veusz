// Phase 1 scaffold. The real app shell lives here once the JSON-RPC
// client (src/rpc/) and the Setting registry (src/components/settings/)
// land. Until then this exists so `vite build` succeeds and tests
// can render a known root.

export function App() {
  return (
    <div data-testid="app-root">
      <h1>Veusz (Tauri shell — Phase 1 scaffold)</h1>
      <p>
        See <code>veusz/daemon/</code> for the headless backend and
        <code>tests/daemon/</code> for live contract tests against the
        JSON-RPC surface this UI consumes.
      </p>
    </div>
  );
}
