/**
 * Schema-driven Inspector test.
 *
 * Imports the actual JSON schema the daemon emits (the same file
 * `tests/daemon/test_schema_golden.py::test_schema_matches_golden`
 * guards) and renders the Inspector for a handful of representative
 * widgets. Asserts every visible row resolves to a real registry
 * leaf — no `fallback-*` placeholders.
 *
 * This is the architectural-bet test: it proves the Setting →
 * component registry actually covers what the daemon hands the
 * frontend, end-to-end, without spinning up the daemon.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import goldenSchemas from '../test/fixtures/schema_golden.json';
import { Inspector } from '../components/inspector/Inspector';
import { registry } from '../components/settings';
import type { WidgetSchema } from '../rpc/types';

type SchemaBag = Record<string, WidgetSchema>;
const schemas = goldenSchemas as unknown as SchemaBag;

function collectTypenames(group: WidgetSchema | (WidgetSchema['subgroups'][number])): string[] {
  const out: string[] = [];
  for (const s of group.settings) {
    if (!s.hidden) out.push(s.typename);
  }
  for (const sg of group.subgroups) {
    out.push(...collectTypenames(sg as never));
  }
  return out;
}

const TEST_WIDGETS = ['xy', 'axis', 'graph', 'image', 'page'];

describe.each(TEST_WIDGETS)('Inspector(%s)', (widgetType) => {
  const schema = schemas[widgetType];

  it('renders without throwing', () => {
    render(<Inspector schema={schema} widgetPaths={[`/${widgetType}1`]} values={{}} onChange={() => {}} />);
    expect(screen.getByTestId('inspector')).toBeInTheDocument();
  });

  it('every visible setting has a real registry leaf (no fallbacks)', () => {
    render(<Inspector schema={schema} widgetPaths={[`/${widgetType}1`]} values={{}} onChange={() => {}} />);
    const fallbacks = screen.queryAllByTestId(/^fallback-/);
    if (fallbacks.length > 0) {
      // Surface which typenames are missing — actionable failure.
      const missing = new Set<string>();
      for (const f of fallbacks) {
        const m = f.parentElement?.textContent?.match(/typename=([^\]]+)/);
        if (m) missing.add(m[1]);
      }
      throw new Error(
        `${widgetType}: ${fallbacks.length} settings fell back to read-only ` +
        `display. Missing typenames in registry: ${[...missing].sort().join(', ')}`,
      );
    }
  });
});

describe('Registry coverage across the full schema golden', () => {
  it('every non-hidden typename across all 38 widgets has a leaf', () => {
    const all = new Set<string>();
    for (const sch of Object.values(schemas)) {
      for (const tn of collectTypenames(sch)) all.add(tn);
    }
    const missing = [...all].filter((tn) => !(tn in registry)).sort();
    expect(missing).toEqual([]);
  });
});
