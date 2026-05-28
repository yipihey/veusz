/**
 * Right-click menu for a property setting label, ported from
 * SettingLabel.settingMenu in treeeditwindow.py:1646.
 *
 * Items:
 *   Reset to default
 *   Copy to ▸          all 'TYPE' widgets / 'TYPE' siblings /
 *                      all 'TYPE' widgets called 'NAME'
 *   Use as default style
 *   Unlink setting     (only when the setting is a reference)
 *
 * The trigger is the setting's *label* (not its editor control), so
 * right-clicking the input keeps native behaviour.
 */

import { type ReactNode } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { DocState } from '../../state/doc';

export interface SettingMenuInfo {
  /** Absolute setting path, e.g. /page1/graph1/xy1/marker. */
  path: string;
  /** Owning widget type (for the Copy-to labels). */
  widgetType: string;
  /** Owning widget name (for the type+name label). */
  widgetName: string;
  /** Whether the setting currently holds a reference link. */
  isReference: boolean;
  /** True for stylesheet settings, where Copy-to / Use-as-default
   *  don't apply (Qt hides them under /StyleSheet/). */
  isStylesheet: boolean;
}

export interface SettingContextMenuProps {
  store: UseBoundStore<StoreApi<DocState>>;
  info: SettingMenuInfo;
  children: ReactNode;
}

const itemStyle: React.CSSProperties = {
  padding: '4px 24px 4px 12px', fontSize: 13, cursor: 'default',
  outline: 'none', userSelect: 'none',
};
const contentStyle: React.CSSProperties = {
  minWidth: 200, background: 'white', border: '1px solid #ccc',
  borderRadius: 4, padding: 4, boxShadow: '0 2px 10px rgba(0,0,0,0.15)', zIndex: 1000,
};
const sep: React.CSSProperties = { height: 1, background: '#eee', margin: 4 };

export function SettingContextMenu({ store, info, children }: SettingContextMenuProps) {
  const act = store.getState();
  const { path, widgetType, widgetName, isReference, isStylesheet } = info;

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content style={contentStyle} data-testid="setting-context-menu">
          <ContextMenu.Item
            style={itemStyle}
            data-testid="setting-reset"
            onSelect={() => void act.resetSettingDefault(path)}
          >
            Reset to default
          </ContextMenu.Item>

          {!isStylesheet && (
            <>
              <ContextMenu.Sub>
                <ContextMenu.SubTrigger style={itemStyle} data-testid="setting-copy-to">
                  Copy to ▸
                </ContextMenu.SubTrigger>
                <ContextMenu.Portal>
                  <ContextMenu.SubContent style={contentStyle}>
                    <ContextMenu.Item
                      style={itemStyle}
                      data-testid="setting-copy-all-type"
                      onSelect={() => void act.propagateSetting(path, 'all_of_type')}
                    >
                      all '{widgetType}' widgets
                    </ContextMenu.Item>
                    <ContextMenu.Item
                      style={itemStyle}
                      data-testid="setting-copy-siblings"
                      onSelect={() => void act.propagateSetting(path, 'siblings')}
                    >
                      '{widgetType}' siblings
                    </ContextMenu.Item>
                    <ContextMenu.Item
                      style={itemStyle}
                      data-testid="setting-copy-type-name"
                      onSelect={() => void act.propagateSetting(path, 'type_and_name')}
                    >
                      all '{widgetType}' widgets called '{widgetName}'
                    </ContextMenu.Item>
                  </ContextMenu.SubContent>
                </ContextMenu.Portal>
              </ContextMenu.Sub>

              <ContextMenu.Item
                style={itemStyle}
                data-testid="setting-set-default"
                onSelect={() => void act.setSettingDefault(path)}
              >
                Use as default style
              </ContextMenu.Item>
            </>
          )}

          {isReference && (
            <>
              <ContextMenu.Separator style={sep} />
              <ContextMenu.Item
                style={itemStyle}
                data-testid="setting-unlink"
                onSelect={() => void act.unlinkSetting(path)}
              >
                Unlink setting
              </ContextMenu.Item>
            </>
          )}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
