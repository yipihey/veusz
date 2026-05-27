// Setting → component registry.
//
// Each Setting typename emitted by the daemon's schema extractor
// maps to one React component here. The inspector iterates a
// WidgetSchema and looks up `registry[setting.typename]` to render
// the leaf. Subgroups recurse through the same registry.
//
// Coverage is enforced on the daemon side by
// `tests/daemon/test_schema_golden.py::test_schema_known_setting_types_covered`
// and on the frontend side by `src/test/schema-driven.test.tsx`,
// which renders the live golden schemas and fails if any non-hidden
// setting falls back to read-only display.

import type { ComponentType } from 'react';
import type { LeafProps } from './types';

import { AxisBound } from './AxisBound';
import { Bool } from './Bool';
import { Choice } from './Choice';
import { ColorPicker } from './ColorPicker';
import { DatasetPicker } from './DatasetPicker';
import { Distance } from './Distance';
import { FilePicker } from './FilePicker';
import { FloatDict } from './FloatDict';
import { FloatList } from './FloatList';
import { FloatOrAuto } from './FloatOrAuto';
import { FloatSlider } from './FloatSlider';
import { LineStylePicker } from './LineStylePicker';
import { ListEditor } from './ListEditor';
import { MarkerPicker } from './MarkerPicker';
import { NumberInput } from './NumberInput';
import { TextInput } from './TextInput';
import { WidgetPathPicker } from './WidgetPathPicker';

export type Leaf = ComponentType<LeafProps & Record<string, unknown>>;

export const registry: Record<string, Leaf> = {
  // Atomic
  'str': TextInput,
  'str-notes': TextInput,
  'bool': Bool,
  'int': NumberInput,
  'float': NumberInput,
  'float-or-auto': FloatOrAuto,
  'int-or-auto': FloatOrAuto,
  'float-slider': FloatSlider,
  'distance': Distance,
  'distance-or-auto': (props) => <Distance {...props} allowAuto />,
  'displacement': Distance,
  'choice': Choice,
  'choice-or-more': (props) => <Choice {...props} editable />,
  'float-choice': (props) => <Choice {...props} editable />,
  'color': ColorPicker,
  'colormap': Choice,
  'marker': MarkerPicker,
  'arrow': Choice,
  'line-style': LineStylePicker,
  'fill-style': Choice,
  'fill-style-ext': Choice,
  'errorbar-style': Choice,
  'align-horz': Choice,
  'align-vert': Choice,
  'align-horz-+manual': Choice,
  'align-vert-+manual': Choice,
  'font-family': TextInput,
  'font-style': TextInput,
  'rotate-interval': Choice,
  'axis-bound': AxisBound,

  // List / composite
  'float-list': FloatList,
  'float-dict': FloatDict,
  'str-multi': ListEditor,
  'line-multi': ListEditor,
  'fill-multi': ListEditor,

  // Reference-by-path
  'dataset': DatasetPicker,
  'dataset-multi': DatasetPicker,
  'dataset-extended': DatasetPicker,
  'dataset-or-str': DatasetPicker,
  'widget-path': WidgetPathPicker,
  'widget-choice': WidgetPathPicker,
  'axis': WidgetPathPicker,

  // File-system
  'filename': FilePicker,
  'filename-image': FilePicker,
  'filename-svg': FilePicker,

  // Internal — kept hidden by the inspector via `setting.hidden`,
  // but mapped here so the registry-coverage assertions report 100%.
  'backward-compat': () => null,
};

// Typenames the daemon emits today. Kept in sync with
// veusz/setting/setting.py and asserted by both the daemon-side
// coverage test and the React schema-driven test.
export const KNOWN_TYPENAMES: ReadonlySet<string> = new Set(
  Object.keys(registry),
);

export function resolve(typename: string): Leaf | null {
  return registry[typename] ?? null;
}
