import { Fragment } from 'react';
import type { SettingsGroup, SettingSchema, WidgetSchema } from '../../rpc/types';
import { resolve } from '../settings';

export interface InspectorProps {
  schema: WidgetSchema;
  /** Current values keyed by absolute path under the widget. */
  values: Record<string, unknown>;
  /** Absolute widget path; child setting paths are derived from this. */
  widgetPath: string;
  /** Dataset names — handed down to dataset pickers. */
  datasets?: string[];
  /** Single edit hook the inspector calls; the caller batches into doc.set. */
  onChange: (path: string, value: unknown) => void;
}

export function Inspector(props: InspectorProps) {
  return (
    <div data-testid="inspector" data-widget={props.widgetPath}>
      <h3 data-testid="inspector-title">{props.schema.typename}</h3>
      <GroupBody
        group={props.schema}
        basePath={props.widgetPath}
        values={props.values}
        datasets={props.datasets}
        onChange={props.onChange}
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
  if (!Leaf) {
    // Registry fallback for typenames we haven't covered yet —
    // show the raw value so the user at least sees it.
    return (
      <div data-testid={`row-${schema.name}`}>
        <label>{schema.usertext || schema.name}</label>
        <code data-testid={`fallback-${schema.name}`}>
          {value === undefined ? '(unset)' : JSON.stringify(value)}
        </code>
        <small> [typename={schema.typename}]</small>
      </div>
    );
  }
  return (
    <div data-testid={`row-${schema.name}`}>
      <label>{schema.usertext || schema.name}</label>
      <Leaf
        schema={schema}
        value={value}
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
