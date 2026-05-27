import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Distance } from './Distance';
import { setting } from '../../test/fixtures';

const schema = setting({ name: 'w', typename: 'distance', default: '1pt' });

describe('Distance', () => {
  it('splits a value like "3cm" into number + unit fields', () => {
    render(<Distance schema={schema} value="3cm" onChange={() => {}} />);
    expect((screen.getByTestId('setting-w-num') as HTMLInputElement).value).toBe('3');
    expect((screen.getByTestId('setting-w-unit') as HTMLSelectElement).value).toBe('cm');
  });

  it('recombines number + unit on commit', () => {
    const onChange = vi.fn();
    render(<Distance schema={schema} value="1pt" onChange={onChange} />);
    const num = screen.getByTestId('setting-w-num');
    fireEvent.change(num, { target: { value: '5' } });
    fireEvent.blur(num);
    expect(onChange).toHaveBeenCalledWith('5pt');
  });

  it('changing unit immediately re-commits', () => {
    const onChange = vi.fn();
    render(<Distance schema={schema} value="2pt" onChange={onChange} />);
    fireEvent.change(screen.getByTestId('setting-w-unit'), { target: { value: 'cm' } });
    expect(onChange).toHaveBeenCalledWith('2cm');
  });

  it('with allowAuto, exposes an Auto toggle that sets "Auto"', () => {
    const onChange = vi.fn();
    render(<Distance schema={schema} value="1pt" onChange={onChange} allowAuto />);
    fireEvent.click(screen.getByTestId('setting-w-auto'));
    expect(onChange).toHaveBeenCalledWith('Auto');
  });
});
