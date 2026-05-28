/**
 * Toolbar row — renders the TOOLBARS groups from the action registry, with a
 * divider between groups. Text buttons for now (no icon assets yet); the
 * tooltip carries the full label + shortcut. Enabled state is live from the
 * store, like the Qt toolbars.
 */

import { Fragment } from 'react';
import type { DocStore } from '../../keys/shortcuts';
import { ACTIONS } from '../../actions/actions';
import { TOOLBARS } from '../../actions/toolbars';
import { actionLabel, type ActionCtx } from '../../actions/types';

export function Toolbars({ store, ctx }: { store: DocStore; ctx: ActionCtx }) {
  const s = store();
  return (
    <div role="toolbar" data-testid="toolbars" style={row}>
      {TOOLBARS.map((g, gi) => (
        <Fragment key={g.id}>
          {gi > 0 && <span style={divider} aria-hidden />}
          {g.actions.map((id) => {
            const act = ACTIONS[id];
            if (!act) return null;
            if (act.visible && !act.visible(s)) return null;
            const enabled = act.enabled ? act.enabled(s) : true;
            const label = actionLabel(act, s);
            return (
              <button
                key={id}
                type="button"
                data-testid={`tool-${id}`}
                disabled={!enabled}
                title={act.shortcut ? `${label} (${act.shortcut})` : label}
                onClick={() => void act.run(ctx)}
                style={btn(enabled)}
              >
                {label}
              </button>
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}

const row: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 3, padding: '4px 6px',
  borderBottom: '1px solid #ddd', flexWrap: 'wrap',
  font: '12px system-ui, sans-serif',
};
const divider: React.CSSProperties = {
  width: 1, alignSelf: 'stretch', background: '#ddd', margin: '2px 4px',
};
function btn(enabled: boolean): React.CSSProperties {
  return {
    border: '1px solid #ddd', background: enabled ? '#fff' : '#f5f5f5',
    color: enabled ? '#222' : '#aaa', padding: '3px 7px', borderRadius: 3,
    cursor: enabled ? 'pointer' : 'default', font: 'inherit', whiteSpace: 'nowrap',
  };
}
