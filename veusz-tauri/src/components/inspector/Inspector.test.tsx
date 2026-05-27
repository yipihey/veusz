import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Inspector } from './Inspector';
import { xyMiniSchema } from '../../test/fixtures';

describe('Inspector', () => {
  const baseProps = {
    schema: xyMiniSchema,
    widgetPath: '/page1/graph1/xy1',
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
});
