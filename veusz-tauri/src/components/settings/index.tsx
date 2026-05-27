// Setting → component registry.
//
// Each Setting typename emitted by the daemon's schema extractor
// maps to one React component here. The inspector iterates a
// WidgetSchema and looks up `registry[setting.typename]` to render
// the leaf. Subgroups recurse through the same registry.
//
// Coverage is enforced from the daemon side by
// `tests/daemon/test_schema_golden.py::test_schema_known_setting_types_covered`,
// which fails CI the moment Veusz introduces a typename that isn't
// listed here.

import type { ComponentType } from 'react';
import type { LeafProps } from './types';

import { Bool } from './Bool';
import { Choice } from './Choice';
import { ColorPicker } from './ColorPicker';
import { DatasetPicker } from './DatasetPicker';
import { Distance } from './Distance';
import { LineStylePicker } from './LineStylePicker';
import { MarkerPicker } from './MarkerPicker';
import { NumberInput } from './NumberInput';
import { TextInput } from './TextInput';

export type Leaf = ComponentType<LeafProps & Record<string, unknown>>;

// Phase-1 subset — covers everything the `xy` widget needs to render
// an editable inspector. Remaining 30+ typenames land in Phase 2.
export const registry: Record<string, Leaf> = {
  'str': TextInput,
  'str-notes': TextInput,
  'bool': Bool,
  'int': NumberInput,
  'float': NumberInput,
  'choice': Choice,
  'choice-or-more': (props) => <Choice {...props} editable />,
  'float-choice': (props) => <Choice {...props} editable />,
  'distance': Distance,
  'distance-or-auto': (props) => <Distance {...props} allowAuto />,
  'displacement': Distance,
  'color': ColorPicker,
  'dataset': DatasetPicker,
  'dataset-multi': DatasetPicker,
  'dataset-extended': DatasetPicker,
  'dataset-or-str': DatasetPicker,
  'marker': MarkerPicker,
  'line-style': LineStylePicker,
  'fill-style': Choice,
  'fill-style-ext': Choice,
  'errorbar-style': Choice,
  'align-horz': Choice,
  'align-vert': Choice,
  'align-horz-+manual': Choice,
  'align-vert-+manual': Choice,
  'arrow': Choice,
  'font-family': TextInput,
  'font-style': TextInput,
  'rotate-interval': Choice,
};

// Typenames the daemon emits today. Kept in sync with
// veusz/setting/setting.py and asserted by the daemon-side coverage
// test. The registry above is a *subset* — typenames in this list but
// not in the registry render as a read-only fallback.
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

export function resolve(typename: string): Leaf | null {
  return registry[typename] ?? null;
}
