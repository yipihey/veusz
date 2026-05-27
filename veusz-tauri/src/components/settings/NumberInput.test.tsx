import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NumberInput } from './NumberInput';
import { setting } from '../../test/fixtures';

const floatSchema = setting({ name: 'w', typename: 'float', default: 0.5 });
const intSchema = setting({ name: 'n', typename: 'int', default: 42, minval: 0, maxval: 100 });

describe('NumberInput', () => {
  it('commits float on blur', () => {
    const onChange = vi.fn();
    render(<NumberInput schema={floatSchema} value={0.5} onChange={onChange} />);
    const inp = screen.getByTestId('setting-w');
    fireEvent.change(inp, { target: { value: '2.5' } });
    fireEvent.blur(inp);
    expect(onChange).toHaveBeenCalledWith(2.5);
  });

  it('commits int on Enter', () => {
    const onChange = vi.fn();
    render(<NumberInput schema={intSchema} value={42} onChange={onChange} />);
    const inp = screen.getByTestId('setting-n');
    fireEvent.change(inp, { target: { value: '7' } });
    fireEvent.keyDown(inp, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(7);
  });

  it('passes through =expr unchanged (Python expression)', () => {
    const onChange = vi.fn();
    render(<NumberInput schema={floatSchema} value={1} onChange={onChange} />);
    const inp = screen.getByTestId('setting-w');
    fireEvent.change(inp, { target: { value: '=pi/2' } });
    fireEvent.blur(inp);
    expect(onChange).toHaveBeenCalledWith('=pi/2');
  });

  it('reverts on garbage input', () => {
    const onChange = vi.fn();
    render(<NumberInput schema={floatSchema} value={1.5} onChange={onChange} />);
    const inp = screen.getByTestId('setting-w') as HTMLInputElement;
    fireEvent.change(inp, { target: { value: 'banana' } });
    fireEvent.blur(inp);
    expect(onChange).not.toHaveBeenCalled();
    expect(inp.value).toBe('1.5');
  });
});
