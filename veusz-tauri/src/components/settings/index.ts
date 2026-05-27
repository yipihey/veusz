// Setting → component registry.
//
// Each Setting typename emitted by the daemon's schema extractor
// maps to one React component here. The inspector iterates a
// WidgetSchema and looks up `registry[setting.typename]` to render
// the leaf. Subgroups recurse through the same registry.
//
// Scaffold only — the 43 leaf components land in Phase 2. The
// catalog matches `veusz/setting/setting.py` and the registry-coverage
// drift test at `tests/daemon/test_schema_golden.py::test_schema_known_setting_types_covered`.

import type { SettingSchema } from '../../rpc/types';

export interface LeafProps {
  schema: SettingSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

type Leaf = (props: LeafProps) => JSX.Element;

// Typenames we promise the daemon's schema extractor will emit.
// Keep in sync with the registry-coverage test.
export const KNOWN_TYPENAMES: ReadonlySet<string> = new Set([
  'str', 'str-notes', 'str-multi',
  'bool',
  'int', 'float',
  'float-or-auto', 'float-slider', 'int-or-auto',
  'distance', 'distance-or-auto', 'displacement',
  'choice', 'choice-or-more', 'float-choice',
  'float-dict', 'float-list',
  'widget-path', 'widget-choice', 'axis',
  'dataset', 'dataset-multi', 'dataset-extended', 'dataset-or-str',
  'color', 'colormap',
  'fill-style', 'fill-style-ext', 'fill-multi',
  'line-style', 'line-multi',
  'marker', 'arrow',
  'errorbar-style',
  'align-horz', 'align-vert',
  'align-horz-+manual', 'align-vert-+manual',
  'filename', 'filename-image', 'filename-svg',
  'font-family', 'font-style',
  'axis-bound', 'rotate-interval',
  'backward-compat',
]);

// Populated in Phase 2; left empty so type-checking still works.
export const registry: Record<string, Leaf> = {};
