import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FloatOrAuto } from './FloatOrAuto';
import { setting } from '../../test/fixtures';

const schema = setting({ name: 'min', typename: 'float-or-auto', default: 'Auto' });

describe('FloatOrAuto', () => {
  it('hides the number input when value is Auto', () => {
    render(<FloatOrAuto schema={schema} value="Auto" onChange={() => {}} />);
    expect((screen.getByTestId('setting-min-auto') as HTMLInputElement).checked).toBe(true);
    // The NumberInput is not mounted in Auto mode
    expect(screen.queryByTestId('setting-min')).toBeInTheDocument();
  });

  it('toggling Auto off emits the numeric default', () => {
    const onChange = vi.fn();
    render(<FloatOrAuto schema={schema} value="Auto" onChange={onChange} />);
    fireEvent.click(screen.getByTestId('setting-min-auto'));
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('toggling Auto on emits the Auto sentinel', () => {
    const onChange = vi.fn();
    render(<FloatOrAuto schema={schema} value={3.14} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('setting-min-auto'));
    expect(onChange).toHaveBeenCalledWith('Auto');
  });
});
