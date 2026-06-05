import { Fragment, useState, type CSSProperties, type ReactNode } from 'react';
import type { ColormapInfo, SettingsGroup, SettingSchema, WidgetSchema } from '../../rpc/types';
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
  /** Colormaps (name + swatch stops) — handed down to the colormap chooser. */
  colormaps?: ColormapInfo[];
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

  // "Only customised": hide rows/groups still at their default value, so just
  // the settings that define this figure remain.
  const [hideDefaults, setHideDefaults] = useState(false);

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <h3 data-testid="inspector-title" style={{ margin: '0.3em 0' }}>{title}</h3>
        <label style={{ fontSize: 12, color: '#666', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', whiteSpace: 'nowrap' }}
          title="Show only settings changed from their default">
          <input type="checkbox" data-testid="inspector-only-customised"
            checked={hideDefaults} onChange={(e) => setHideDefaults(e.target.checked)} />
          Only customised
        </label>
      </div>
      <GroupBody
        group={props.schema}
        basePath={base}
        widgetPath={base}
        values={props.values}
        datasets={props.datasets}
        colormaps={props.colormaps}
        onChange={handleChange}
        settingMenu={props.settingMenu}
        groupOpen={groupOpen}
        setGroupOpen={setGroupOpen}
        hideDefaults={hideDefaults}
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

/** True when any (recursive) leaf of the group is customised (not at default),
 *  so the group's header can be emphasised and kept when "only customised". */
function groupHasCustomised(
  g: SettingsGroup, basePath: string, values: Record<string, unknown>,
): boolean {
  for (const s of g.settings) {
    if (s.hidden) continue;
    if (!isAtDefault(s, values[joinPath(basePath, s.name)], s.mixed_value === true)) return true;
  }
  for (const sub of g.subgroups) {
    if (groupHasCustomised(sub, joinPath(basePath, sub.name), values)) return true;
  }
  return false;
}

interface GroupBodyProps {
  group: SettingsGroup;
  basePath: string;
  /** The owning widget path — constant through subgroup recursion. */
  widgetPath: string;
  values: Record<string, unknown>;
  datasets?: string[];
  colormaps?: ColormapInfo[];
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
  /** Hide rows/groups still at their default value. */
  hideDefaults: boolean;
}

function GroupBody({ group, basePath, widgetPath, values, datasets, colormaps, onChange, settingMenu, groupLabel, groupOpen, setGroupOpen, hideDefaults }: GroupBodyProps) {
  return (
    <Fragment>
      {group.settings.map((s) => {
        if (s.hidden) return null;
        const v = values[joinPath(basePath, s.name)];
        if (hideDefaults && isAtDefault(s, v, s.mixed_value === true)) return null;
        return (
          <SettingRow
            key={s.name}
            schema={s}
            basePath={basePath}
            widgetPath={widgetPath}
            value={v}
            datasets={datasets}
            colormaps={colormaps}
            onChange={onChange}
            settingMenu={settingMenu}
            groupLabel={groupLabel}
          />
        );
      })}
      {group.subgroups.map((sub) => {
        const label = sub.usertext || humanize(sub.name);
        const subPath = joinPath(basePath, sub.name);
        const customised = groupHasCustomised(sub, subPath, values);
        // In "only customised" mode, drop all-default groups and auto-expand
        // the ones that contain customised settings so they're visible.
        if (hideDefaults && !customised) return null;
        const open = hideDefaults ? customised : groupOpen(subPath, sub);
        return (
          <details
            key={sub.name}
            data-testid={`subgroup-${sub.name}`}
            data-customised={customised || undefined}
            open={open}
            onToggle={(e) => {
              const el = e.currentTarget as HTMLDetailsElement;
              // Prefer the IDL property; fall back to the attribute for DOM
              // implementations (e.g. happy-dom) that don't reflect `.open`.
              const isOpen = typeof el.open === 'boolean' ? el.open : el.hasAttribute('open');
              if (isOpen !== open) setGroupOpen(subPath, isOpen);
            }}
          >
            {/* Dim a group that's entirely at default; emphasise one with edits. */}
            <summary style={{ opacity: customised ? 1 : 0.5, fontWeight: customised ? 600 : 400 }}>
              {label}
            </summary>
            <GroupBody
              group={sub}
              basePath={subPath}
              widgetPath={widgetPath}
              values={values}
              datasets={datasets}
              colormaps={colormaps}
              onChange={onChange}
              settingMenu={settingMenu}
              groupLabel={label}
              groupOpen={groupOpen}
              setGroupOpen={setGroupOpen}
              hideDefaults={hideDefaults}
            />
          </details>
        );
      })}
    </Fragment>
  );
}

/** Loose equality for a setting value vs its default. Handles the common cases
 *  (primitives, distance strings like "1pt", and list/dict values) without
 *  caring about number-vs-string representation differences. */
function settingsValueEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a === 'object' || typeof b === 'object') {
    try { return JSON.stringify(a) === JSON.stringify(b); } catch { return false; }
  }
  return String(a) === String(b);
}

/** True when a setting still holds its schema default (so it can be dimmed,
 *  making the *customised* settings of a figure stand out). A value that
 *  differs from default — or differs across a multi-selection (`mixed`) — is
 *  treated as customised. An unset value is effectively the default. */
function isAtDefault(schema: SettingSchema, value: unknown, mixed: boolean): boolean {
  if (mixed) return false;
  if (value === undefined) return true;
  return settingsValueEqual(value, schema.default);
}

/** Row style: dim defaults; give customised rows a left accent so they pop. */
function rowStyle(atDefault: boolean): CSSProperties {
  return {
    borderLeft: `2px solid ${atDefault ? 'transparent' : '#1f6feb'}`,
    paddingLeft: 6,
    opacity: atDefault ? 0.5 : 1,
  };
}

function SettingRow({
  schema,
  basePath,
  widgetPath,
  value,
  datasets,
  colormaps,
  onChange,
  settingMenu,
  groupLabel,
}: {
  schema: SettingSchema;
  basePath: string;
  widgetPath: string;
  value: unknown;
  datasets?: string[];
  colormaps?: ColormapInfo[];
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
  const atDefault = isAtDefault(schema, value, mixed);

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
      <div data-testid={`row-${schema.name}`} data-mixed={mixed || undefined}
        data-default={atDefault || undefined} style={rowStyle(atDefault)}>
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
      data-default={atDefault || undefined}
      style={rowStyle(atDefault)}
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
        colormaps={colormaps}
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
