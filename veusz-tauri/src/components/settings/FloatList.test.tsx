import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FloatList } from './FloatList';
import { setting } from '../../test/fixtures';

const schema = setting({ name: 'xs', typename: 'float-list', default: [] });

describe('FloatList', () => {
  it('parses comma-separated numbers', () => {
    const onChange = vi.fn();
    render(<FloatList schema={schema} value={[]} onChange={onChange} />);
    const inp = screen.getByTestId('setting-xs');
    fireEvent.change(inp, { target: { value: '1, 2.5, 3' } });
    fireEvent.blur(inp);
    expect(onChange).toHaveBeenCalledWith([1, 2.5, 3]);
  });

  it('forwards =expr as a string for server-side eval', () => {
    const onChange = vi.fn();
    render(<FloatList schema={schema} value={[]} onChange={onChange} />);
    const inp = screen.getByTestId('setting-xs');
    fireEvent.change(inp, { target: { value: '=arange(10)' } });
    fireEvent.blur(inp);
    expect(onChange).toHaveBeenCalledWith('=arange(10)');
  });

  it('passes garbage through as text so the daemon can reject it', () => {
    const onChange = vi.fn();
    render(<FloatList schema={schema} value={[]} onChange={onChange} />);
    const inp = screen.getByTestId('setting-xs');
    fireEvent.change(inp, { target: { value: '1, banana, 3' } });
    fireEvent.blur(inp);
    expect(onChange).toHaveBeenCalledWith('1, banana, 3');
  });

  it('round-trips initial array to a comma-joined string', () => {
    render(<FloatList schema={schema} value={[1, 2, 3]} onChange={() => {}} />);
    expect((screen.getByTestId('setting-xs') as HTMLInputElement).value).toBe('1, 2, 3');
  });
});
