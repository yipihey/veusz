import { Fragment } from 'react';
import type { SettingsGroup, SettingSchema, WidgetSchema } from '../../rpc/types';
import { resolve } from '../settings';

export interface InspectorProps {
  schema: WidgetSchema;
  /** Current values keyed by absolute path under the FIRST widget. */
  values: Record<string, unknown>;
  /**
   * Selected widget paths. One entry → single-widget editing (writes
   * go to that widget). More than one → multi-edit: the schema is the
   * common intersection (`doc.common_schema`) and each edit fans out
   * to every selected widget via `onChangeMany`.
   */
  widgetPaths: string[];
  /** Dataset names — handed down to dataset pickers. */
  datasets?: string[];
  /** Single-widget edit hook (absolute path). */
  onChange: (path: string, value: unknown) => void;
  /** Multi-widget batched edit hook — one op per selected widget,
   *  applied in a single undo step. Required when widgetPaths > 1. */
  onChangeMany?: (ops: Array<{ path: string; value: unknown }>) => void;
}

export function Inspector(props: InspectorProps) {
  const base = props.widgetPaths[0];
  const multi = props.widgetPaths.length > 1;

  // For multi-edit, an edit on the leaf at absolute path
  // `${base}${rel}` must be applied to every selected widget at
  // `${widgetPath}${rel}`. We compute the relative tail off `base`.
  const handleChange = (absPath: string, value: unknown) => {
    if (!multi) {
      props.onChange(absPath, value);
      return;
    }
    const rel = absPath.slice(base.length); // includes leading '/'
    const ops = props.widgetPaths.map((w) => ({ path: w + rel, value }));
    props.onChangeMany?.(ops);
  };

  const title = multi
    ? `${props.schema.typenames?.join(', ') ?? 'widgets'} ×${props.widgetPaths.length}`
    : props.schema.typename ?? '';

  return (
    <div
      data-testid="inspector"
      data-widget={base}
      data-multi={multi || undefined}
      data-count={props.widgetPaths.length}
    >
      <h3 data-testid="inspector-title">{title}</h3>
      <GroupBody
        group={props.schema}
        basePath={base}
        values={props.values}
        datasets={props.datasets}
        onChange={handleChange}
      />
    </div>
  );
}

interface GroupBodyProps {
  group: SettingsGroup;
  basePath: string;
  values: Record<string, unknown>;
  datasets?: string[];
  onChange: (path: string, value: unknown) => void;
}

function GroupBody({ group, basePath, values, datasets, onChange }: GroupBodyProps) {
  return (
    <Fragment>
      {group.settings.map((s) =>
        s.hidden ? null : (
          <SettingRow
            key={s.name}
            schema={s}
            basePath={basePath}
            value={values[joinPath(basePath, s.name)]}
            datasets={datasets}
            onChange={onChange}
          />
        ),
      )}
      {group.subgroups.map((sub) => (
        <details key={sub.name} data-testid={`subgroup-${sub.name}`} open>
          <summary>{sub.usertext || sub.name}</summary>
          <GroupBody
            group={sub}
            basePath={joinPath(basePath, sub.name)}
            values={values}
            datasets={datasets}
            onChange={onChange}
          />
        </details>
      ))}
    </Fragment>
  );
}

function SettingRow({
  schema,
  basePath,
  value,
  datasets,
  onChange,
}: {
  schema: SettingSchema;
  basePath: string;
  value: unknown;
  datasets?: string[];
  onChange: (path: string, value: unknown) => void;
}) {
  const Leaf = resolve(schema.typename);
  const path = joinPath(basePath, schema.name);
  // Multi-edit: when the selected widgets disagree on this setting,
  // the daemon flags `mixed_value` and nulls `value`. Reflect that
  // with a marker the leaf controls can read (and the row dims its
  // label) — matches Qt's italic "differing values" affordance.
  const mixed = schema.mixed_value === true;
  if (!Leaf) {
    // Registry fallback for typenames we haven't covered yet —
    // show the raw value so the user at least sees it.
    return (
      <div data-testid={`row-${schema.name}`} data-mixed={mixed || undefined}>
        <label>{schema.usertext || schema.name}</label>
        <code data-testid={`fallback-${schema.name}`}>
          {value === undefined ? '(unset)' : JSON.stringify(value)}
        </code>
        <small> [typename={schema.typename}]</small>
      </div>
    );
  }
  return (
    <div
      data-testid={`row-${schema.name}`}
      data-mixed={mixed || undefined}
    >
      <label style={mixed ? { fontStyle: 'italic', color: '#888' } : undefined}>
        {schema.usertext || schema.name}
        {mixed ? ' (mixed)' : ''}
      </label>
      <Leaf
        schema={schema}
        value={mixed ? undefined : value}
        datasets={datasets}
        onChange={(v) => onChange(path, v)}
      />
    </div>
  );
}

function joinPath(parent: string, name: string): string {
  if (parent === '/') return '/' + name;
  return parent + '/' + name;
}
