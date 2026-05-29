import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColorPicker } from './ColorPicker';
import type { SettingSchema } from '../../rpc/types';

const schema: SettingSchema = {
  name: 'color',
  typename: 'color',
  default: 'auto',
  usertext: 'Color',
  descr: '',
  hidden: false,
  formatting: false,
};

describe('ColorPicker', () => {
  it('resolves named colours so the swatch shows them, not black', () => {
    // Before: `red` rendered as `#000000` (the named-color → hex fallback).
    // After: the DOM resolver maps it to #ff0000 and the swatch is red.
    render(<ColorPicker schema={schema} value="red" onChange={() => {}} />);
    const swatch = screen.getByTestId('setting-color-color') as HTMLInputElement;
    expect(swatch.value).toBe('#ff0000');
  });

  it('passes hex values straight through', () => {
    render(<ColorPicker schema={schema} value="#1f6feb" onChange={() => {}} />);
    expect((screen.getByTestId('setting-color-color') as HTMLInputElement).value)
      .toBe('#1f6feb');
  });

  it('reports edits as the raw picked hex', () => {
    const onChange = vi.fn();
    render(<ColorPicker schema={schema} value="red" onChange={onChange} />);
    fireEvent.change(screen.getByTestId('setting-color-color'),
      { target: { value: '#00cc00' } });
    expect(onChange).toHaveBeenCalledWith('#00cc00');
  });
});
