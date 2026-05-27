/**
 * Small WidgetSchema fixtures for unit tests. Hand-built rather than
 * captured from the daemon so the tests stay deterministic and don't
 * require the Python side to run.
 */
import type { SettingSchema, WidgetSchema } from '../rpc/types';

export const setting = (over: Partial<SettingSchema> & Pick<SettingSchema, 'name' | 'typename' | 'default'>): SettingSchema => ({
  descr: '',
  usertext: '',
  formatting: false,
  hidden: false,
  ...over,
});

export const xyMiniSchema: WidgetSchema = {
  typename: 'xy',
  mode: 'class',
  name: 'Widget_xy',
  usertext: '',
  descr: '',
  setnsmode: 'widgetsettings',
  settings: [
    setting({ name: 'xData', typename: 'dataset', default: '', usertext: 'X data' }),
    setting({ name: 'yData', typename: 'dataset', default: '', usertext: 'Y data' }),
    setting({
      name: 'marker', typename: 'marker', default: 'circle', usertext: 'Marker',
      vallist: ['circle', 'square', 'diamond'],
    }),
    setting({ name: 'markerSize', typename: 'distance', default: '3pt', usertext: 'Size' }),
    setting({ name: 'hide', typename: 'bool', default: false, usertext: 'Hide' }),
    setting({
      name: 'transparency', typename: 'int', default: 0,
      minval: 0, maxval: 100, usertext: 'Transparency',
    }),
  ],
  subgroups: [
    {
      name: 'PlotLine', usertext: 'Plot line', descr: '', setnsmode: 'formatting',
      settings: [
        setting({ name: 'color', typename: 'color', default: 'auto', usertext: 'Color' }),
        setting({ name: 'width', typename: 'distance', default: '0.5pt', usertext: 'Width' }),
        setting({
          name: 'style', typename: 'line-style', default: 'solid',
          vallist: ['solid', 'dashed', 'dotted'], usertext: 'Style',
        }),
        setting({ name: 'hide', typename: 'bool', default: false, usertext: 'Hide' }),
      ],
      subgroups: [],
    },
  ],
};
