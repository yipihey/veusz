import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Inspector } from './Inspector';
import { xyMiniSchema } from '../../test/fixtures';

describe('Inspector', () => {
  const baseProps = {
    schema: xyMiniSchema,
    widgetPaths: ['/page1/graph1/xy1'],
    datasets: ['x', 'y'],
    values: {
      '/page1/graph1/xy1/xData': 'x',
      '/page1/graph1/xy1/yData': 'y',
      '/page1/graph1/xy1/marker': 'circle',
      '/page1/graph1/xy1/markerSize': '3pt',
      '/page1/graph1/xy1/hide': false,
      '/page1/graph1/xy1/transparency': 0,
      '/page1/graph1/xy1/PlotLine/color': 'auto',
      '/page1/graph1/xy1/PlotLine/width': '0.5pt',
      '/page1/graph1/xy1/PlotLine/style': 'solid',
      '/page1/graph1/xy1/PlotLine/hide': false,
    } as Record<string, unknown>,
  };

  it('renders the widget title', () => {
    render(<Inspector {...baseProps} onChange={() => {}} />);
    expect(screen.getByTestId('inspector-title')).toHaveTextContent('xy');
  });

  it('renders every top-level setting row', () => {
    render(<Inspector {...baseProps} onChange={() => {}} />);
    // `hide` exists in both the top-level settings and the PlotLine
    // subgroup; getAllByTestId returns both, so the top-level should
    // be at least one match.
    expect(screen.getAllByTestId('row-hide').length).toBeGreaterThanOrEqual(1);
    for (const name of ['xData', 'yData', 'marker', 'markerSize', 'transparency']) {
      expect(screen.getByTestId(`row-${name}`)).toBeInTheDocument();
    }
  });

  it('renders the PlotLine subgroup with its leaves', () => {
    render(<Inspector {...baseProps} onChange={() => {}} />);
    const sub = screen.getByTestId('subgroup-PlotLine');
    for (const name of ['color', 'width', 'style', 'hide']) {
      expect(within(sub).getByTestId(`row-${name}`)).toBeInTheDocument();
    }
  });

  it('collapses formatting subgroups by default but keeps their content mounted', () => {
    render(<Inspector {...baseProps} onChange={() => {}} />);
    // PlotLine has setnsmode 'formatting' → collapsed by default to keep the
    // panel short on small screens, but its leaves stay in the DOM.
    const sub = screen.getByTestId('subgroup-PlotLine');
    expect(sub.hasAttribute('open')).toBe(false);
    expect(within(sub).getByTestId('row-color')).toBeInTheDocument();
  });

  it('keeps non-formatting (data) subgroups open by default', () => {
    // A groupedsetting subgroup carries data, not just styling → stays open.
    const schema = {
      ...baseProps.schema,
      subgroups: [{
        name: 'Range', usertext: 'Range', descr: '', setnsmode: 'groupedsetting',
        settings: [{
          name: 'min', typename: 'float', default: 0,
          usertext: 'Min', descr: '', hidden: false, formatting: false,
        }],
        subgroups: [],
      }],
    } as never;
    render(<Inspector schema={schema} widgetPaths={['/x']} values={{}} onChange={() => {}} />);
    expect(screen.getByTestId('subgroup-Range').hasAttribute('open')).toBe(true);
  });

  it('remembers a user expand of a subgroup across re-renders', () => {
    const { rerender } = render(<Inspector {...baseProps} onChange={() => {}} />);
    const sub = screen.getByTestId('subgroup-PlotLine');
    // Simulate the native <details> expand: set the attribute and fire toggle.
    sub.setAttribute('open', '');
    fireEvent(sub, new Event('toggle', { bubbles: true }));
    rerender(<Inspector {...baseProps} onChange={() => {}} />);
    expect(screen.getByTestId('subgroup-PlotLine').hasAttribute('open')).toBe(true);
  });

  it('emits onChange with the full setting path when a leaf changes', () => {
    const onChange = vi.fn();
    render(<Inspector {...baseProps} onChange={onChange} />);
    fireEvent.change(screen.getByTestId('setting-marker'), { target: { value: 'square' } });
    expect(onChange).toHaveBeenCalledWith('/page1/graph1/xy1/marker', 'square');
  });

  it('emits onChange with the subgroup-qualified path', () => {
    const onChange = vi.fn();
    render(<Inspector {...baseProps} onChange={onChange} />);
    const sub = screen.getByTestId('subgroup-PlotLine');
    fireEvent.change(within(sub).getByTestId('setting-style'), {
      target: { value: 'dashed' },
    });
    expect(onChange).toHaveBeenCalledWith('/page1/graph1/xy1/PlotLine/style', 'dashed');
  });

  it('disambiguates shared leaf names with the enclosing subgroup label', () => {
    // The xy widget has a `color` leaf inside PlotLine (and MarkerFill,
    // MarkerLine, …); rendering each just as "Color" makes them
    // indistinguishable. The row should read "Plot line color" instead.
    render(<Inspector {...baseProps} onChange={() => {}} />);
    const sub = screen.getByTestId('subgroup-PlotLine');
    expect(within(sub).getByText('Plot line color')).toBeInTheDocument();
    expect(within(sub).getByText('Plot line hide')).toBeInTheDocument();
    expect(within(sub).getByText('Plot line width')).toBeInTheDocument();
    expect(within(sub).getByText('Plot line style')).toBeInTheDocument();
  });

  it('uses the descr for the top-level master color (when distinct)', () => {
    // Real backend: the top-level `color` setting has usertext "Color"
    // but descr "Master color" — surfacing descr disambiguates it from
    // the per-subgroup colors below.
    const schema = {
      typename: 'xy', mode: 'class', name: 'xy', usertext: '', descr: '', setnsmode: '',
      settings: [{
        name: 'color', typename: 'color', default: 'auto',
        usertext: 'Color', descr: 'Master color', hidden: false, formatting: false,
      }],
      subgroups: [],
    } as never;
    render(<Inspector schema={schema} widgetPaths={['/x']} values={{}} onChange={() => {}} />);
    expect(screen.getByText('Master color')).toBeInTheDocument();
  });

  it('hands the dataset list down to dataset pickers', () => {
    render(<Inspector {...baseProps} onChange={() => {}} />);
    const xRow = screen.getByTestId('row-xData');
    const list = xRow.querySelector('datalist');
    expect(list?.querySelectorAll('option')).toHaveLength(2);
  });

  describe('multi-edit', () => {
    const multiProps = {
      ...baseProps,
      widgetPaths: ['/page1/graph1/xy1', '/page1/graph1/xy2'],
      // Pretend common_schema gave us the same mini schema; the
      // important part is widgetPaths.length > 1.
    };

    it('fans an edit out to every selected widget via onChangeMany', () => {
      const onChange = vi.fn();
      const onChangeMany = vi.fn();
      render(
        <Inspector {...multiProps} onChange={onChange} onChangeMany={onChangeMany} />,
      );
      fireEvent.change(screen.getByTestId('setting-marker'), {
        target: { value: 'square' },
      });
      // Single-widget onChange must NOT be used in multi mode.
      expect(onChange).not.toHaveBeenCalled();
      expect(onChangeMany).toHaveBeenCalledWith([
        { path: '/page1/graph1/xy1/marker', value: 'square' },
        { path: '/page1/graph1/xy2/marker', value: 'square' },
      ]);
    });

    it('titles the panel with the type and selection count', () => {
      render(<Inspector {...multiProps} onChange={() => {}} onChangeMany={() => {}} />);
      expect(screen.getByTestId('inspector').dataset.multi).toBe('true');
      expect(screen.getByTestId('inspector').dataset.count).toBe('2');
    });
  });

  it('marks a mixed-value setting and dims its label', () => {
    // Clone the mini schema but flag `marker` as mixed.
    const mixedSchema = {
      ...baseProps.schema,
      settings: baseProps.schema.settings.map((s) =>
        s.name === 'marker' ? { ...s, mixed_value: true, value: null } : s,
      ),
    };
    render(
      <Inspector
        {...baseProps}
        schema={mixedSchema}
        widgetPaths={['/a', '/b']}
        onChange={() => {}}
        onChangeMany={() => {}}
      />,
    );
    expect(screen.getByTestId('row-marker').dataset.mixed).toBe('true');
  });
});
