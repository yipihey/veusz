import { Fragment, useState, type ReactNode } from 'react';
import type { SettingsGroup, SettingSchema, WidgetSchema } from '../../rpc/types';
import { resolve } from '../settings';

/** Context passed to the optional per-setting right-click menu. */
export interface SettingMenuContext {
  path: string;
  name: string;
  /** Absolute path of the owning widget (the Inspector's base). */
  widgetPath: string;
  isReference: boolean;
  isStylesheet: boolean;
}

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
  /** Optional wrapper that injects a right-click menu around a
   *  setting's *label*. Omitted in unit tests / the stylesheet editor. */
  settingMenu?: (ctx: SettingMenuContext, label: ReactNode) => ReactNode;
}

export function Inspector(props: InspectorProps) {
  const base = props.widgetPaths[0];
  const multi = props.widgetPaths.length > 1;

  // Per-subgroup expand/collapse state. Formatting-only subgroups (PlotLine,
  // MarkerFill, …) collapse by default so a complex widget isn't a 2000px
  // scroll — critical on small screens — while data-bearing groups stay open.
  // We only store *user overrides*; the default is derived per group so newly
  // appearing groups follow the rule without seeding state. Keyed by relative
  // subgroup path so it survives re-renders while the same widget is selected.
  const [openOverrides, setOpenOverrides] = useState<Record<string, boolean>>({});
  const groupOpen = (relPath: string, group: SettingsGroup): boolean =>
    openOverrides[relPath] ?? !groupIsFormatting(group);
  const setGroupOpen = (relPath: string, open: boolean) =>
    setOpenOverrides((prev) => ({ ...prev, [relPath]: open }));

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
        widgetPath={base}
        values={props.values}
        datasets={props.datasets}
        onChange={handleChange}
        settingMenu={props.settingMenu}
        groupOpen={groupOpen}
        setGroupOpen={setGroupOpen}
      />
    </div>
  );
}

/** A subgroup collapses by default when it is a pure *formatting* collection
 *  (`setnsmode === 'formatting'`, the daemon's canonical marker for groups like
 *  PlotLine / MarkerFill / FillBelow). Data-bearing groups (`groupedsetting`,
 *  `widgetsettings`) stay open. Driving this off the schema's own `setnsmode`
 *  keeps the rule schema-driven rather than hand-listing group names. Falls
 *  back to aggregating leaf `formatting` flags when `setnsmode` is absent. */
function groupIsFormatting(g: SettingsGroup): boolean {
  if (g.setnsmode) return g.setnsmode === 'formatting';
  const leaves = g.settings.filter((s) => !s.hidden);
  if (leaves.length > 0) return leaves.every((s) => s.formatting);
  if (g.subgroups.length > 0) return g.subgroups.every(groupIsFormatting);
  return false;
}

interface GroupBodyProps {
  group: SettingsGroup;
  basePath: string;
  /** The owning widget path — constant through subgroup recursion. */
  widgetPath: string;
  values: Record<string, unknown>;
  datasets?: string[];
  onChange: (path: string, value: unknown) => void;
  settingMenu?: (ctx: SettingMenuContext, label: ReactNode) => ReactNode;
  /** Enclosing subgroup's display label (undefined at the top level). Used
   *  by `SettingRow` to disambiguate identically-named leaves like `color`
   *  across PlotLine / MarkerFill / MarkerLine etc. */
  groupLabel?: string;
  /** Effective open state for a subgroup (by its basePath). */
  groupOpen: (relPath: string, group: SettingsGroup) => boolean;
  /** Record a user expand/collapse for a subgroup (by its basePath). */
  setGroupOpen: (relPath: string, open: boolean) => void;
}

function GroupBody({ group, basePath, widgetPath, values, datasets, onChange, settingMenu, groupLabel, groupOpen, setGroupOpen }: GroupBodyProps) {
  return (
    <Fragment>
      {group.settings.map((s) =>
        s.hidden ? null : (
          <SettingRow
            key={s.name}
            schema={s}
            basePath={basePath}
            widgetPath={widgetPath}
            value={values[joinPath(basePath, s.name)]}
            datasets={datasets}
            onChange={onChange}
            settingMenu={settingMenu}
            groupLabel={groupLabel}
          />
        ),
      )}
      {group.subgroups.map((sub) => {
        const label = sub.usertext || humanize(sub.name);
        const subPath = joinPath(basePath, sub.name);
        const open = groupOpen(subPath, sub);
        return (
          <details
            key={sub.name}
            data-testid={`subgroup-${sub.name}`}
            open={open}
            onToggle={(e) => {
              const el = e.currentTarget as HTMLDetailsElement;
              // Prefer the IDL property; fall back to the attribute for DOM
              // implementations (e.g. happy-dom) that don't reflect `.open`.
              const isOpen = typeof el.open === 'boolean' ? el.open : el.hasAttribute('open');
              if (isOpen !== open) setGroupOpen(subPath, isOpen);
            }}
          >
            <summary>{label}</summary>
            <GroupBody
              group={sub}
              basePath={subPath}
              widgetPath={widgetPath}
              values={values}
              datasets={datasets}
              onChange={onChange}
              settingMenu={settingMenu}
              groupLabel={label}
              groupOpen={groupOpen}
              setGroupOpen={setGroupOpen}
            />
          </details>
        );
      })}
    </Fragment>
  );
}

function SettingRow({
  schema,
  basePath,
  widgetPath,
  value,
  datasets,
  onChange,
  settingMenu,
  groupLabel,
}: {
  schema: SettingSchema;
  basePath: string;
  widgetPath: string;
  value: unknown;
  datasets?: string[];
  onChange: (path: string, value: unknown) => void;
  settingMenu?: (ctx: SettingMenuContext, label: ReactNode) => ReactNode;
  groupLabel?: string;
}) {
  const Leaf = resolve(schema.typename);
  const path = joinPath(basePath, schema.name);
  const label = labelFor(schema, groupLabel);
  // Multi-edit: when the selected widgets disagree on this setting,
  // the daemon flags `mixed_value` and nulls `value`. Reflect that
  // with a marker the leaf controls can read (and the row dims its
  // label) — matches Qt's italic "differing values" affordance.
  const mixed = schema.mixed_value === true;

  // Wrap a label element with the optional right-click menu.
  const wrapLabel = (labelEl: ReactNode): ReactNode =>
    settingMenu
      ? settingMenu(
          {
            path,
            name: schema.name,
            widgetPath,
            isReference: schema.is_reference === true,
            isStylesheet: path.startsWith('/StyleSheet/'),
          },
          labelEl,
        )
      : labelEl;

  if (!Leaf) {
    // Registry fallback for typenames we haven't covered yet —
    // show the raw value so the user at least sees it.
    return (
      <div data-testid={`row-${schema.name}`} data-mixed={mixed || undefined}>
        {wrapLabel(<label>{label}</label>)}
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
      {wrapLabel(
        <label style={mixed ? { fontStyle: 'italic', color: '#888' } : undefined}>
          {label}
          {mixed ? ' (mixed)' : ''}
        </label>,
      )}
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

/** Turn a CamelCase / PascalCase setting-group name into a readable label
 *  ("MarkerFill" → "Marker fill"). Only used as a fallback when the schema
 *  doesn't supply `usertext`. */
function humanize(s: string): string {
  if (!s) return s;
  const spaced = s.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

/** Leaves with these names appear in multiple subgroups (PlotLine, MarkerFill,
 *  MarkerLine, …) on the same widget. The subgroup header alone is too easy to
 *  miss — prefixing the row label with the group disambiguates them. */
const AMBIGUOUS_SUBGROUP_LEAVES = new Set(['color', 'hide', 'width', 'style']);

function labelFor(schema: SettingSchema, groupLabel: string | undefined): string {
  const base = schema.usertext || schema.name;
  if (!groupLabel) {
    // Top-level: surface a more descriptive label when the schema provides one
    // — notably the master `color` setting whose descr is "Master color" while
    // its usertext is just "Color", which is impossible to tell apart from the
    // PlotLine/MarkerFill/etc. colors below it.
    if (schema.name === 'color' && schema.descr) return schema.descr;
    return base;
  }
  // Inside a subgroup: prefix shared-name leaves with the group's label so
  // "Color" under MarkerFill reads as "Marker fill color", not just "Color".
  if (AMBIGUOUS_SUBGROUP_LEAVES.has(schema.name)) {
    return `${groupLabel} ${base.toLowerCase()}`;
  }
  return base;
}
