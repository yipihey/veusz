import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Bool } from './Bool';
import { setting } from '../../test/fixtures';

describe('Bool', () => {
  it('renders checked when value is true', () => {
    render(<Bool schema={setting({ name: 'hide', typename: 'bool', default: false })} value={true} onChange={() => {}} />);
    expect(screen.getByTestId('setting-hide')).toBeChecked();
  });

  it('emits onChange with the new boolean', () => {
    const onChange = vi.fn();
    render(<Bool schema={setting({ name: 'hide', typename: 'bool', default: false })} value={false} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('setting-hide'));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
