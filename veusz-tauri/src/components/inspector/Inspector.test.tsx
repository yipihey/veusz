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
