import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColormapPicker } from './ColormapPicker';
import type { ColormapInfo } from '../../rpc/types';
import { setting } from '../../test/fixtures';

const schema = setting({ name: 'colorMap', typename: 'colormap', default: 'grey' });

const cmaps: ColormapInfo[] = [
  { name: 'viridis', colors: [[68, 1, 84], [253, 231, 36]], step: false },
  { name: 'plasma', colors: [[13, 8, 135], [240, 249, 33]], step: false },
  { name: 'grey', colors: [[0, 0, 0], [255, 255, 255]], step: false },
  { name: 'spectrum-step', colors: [[255, 0, 0], [0, 0, 255]], step: true },
];

describe('ColormapPicker', () => {
  it('falls back to a text input when no colormap list is available', () => {
    render(<ColormapPicker schema={schema} value="grey" onChange={() => {}} />);
    const inp = screen.getByTestId('setting-colorMap') as HTMLInputElement;
    expect(inp.tagName).toBe('INPUT');
    expect(inp.value).toBe('grey');
  });

  it('shows the current map on a swatch trigger and opens a searchable list', () => {
    render(<ColormapPicker schema={schema} value="grey" onChange={() => {}} colormaps={cmaps} />);
    const trigger = screen.getByTestId('setting-colorMap-trigger');
    expect(trigger.textContent).toContain('grey');
    // closed initially
    expect(screen.queryByTestId('setting-colorMap-panel')).toBeNull();
    fireEvent.click(trigger);
    // all maps listed
    expect(screen.getByTestId('cmap-opt-viridis')).toBeTruthy();
    expect(screen.getByTestId('cmap-opt-spectrum-step')).toBeTruthy();
  });

  it('filters the list as you type', () => {
    render(<ColormapPicker schema={schema} value="grey" onChange={() => {}} colormaps={cmaps} />);
    fireEvent.click(screen.getByTestId('setting-colorMap-trigger'));
    fireEvent.change(screen.getByTestId('setting-colorMap-search'), { target: { value: 'plas' } });
    expect(screen.getByTestId('cmap-opt-plasma')).toBeTruthy();
    expect(screen.queryByTestId('cmap-opt-viridis')).toBeNull();
  });

  it('emits onChange with the chosen colormap name', () => {
    const onChange = vi.fn();
    render(<ColormapPicker schema={schema} value="grey" onChange={onChange} colormaps={cmaps} />);
    fireEvent.click(screen.getByTestId('setting-colorMap-trigger'));
    fireEvent.click(screen.getByTestId('cmap-opt-plasma'));
    expect(onChange).toHaveBeenCalledWith('plasma');
  });
});
