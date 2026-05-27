import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Choice } from './Choice';
import { setting } from '../../test/fixtures';

const schema = setting({
  name: 'mode', typename: 'choice', default: 'a',
  vallist: ['a', 'b', 'c'], uilist: ['Alpha', 'Bravo', 'Charlie'],
});

describe('Choice', () => {
  it('renders all options with uilist labels', () => {
    render(<Choice schema={schema} value="a" onChange={() => {}} />);
    const sel = screen.getByTestId('setting-mode') as HTMLSelectElement;
    expect(sel.options).toHaveLength(3);
    expect(sel.options[1].textContent).toBe('Bravo');
  });

  it('emits onChange when selection changes', () => {
    const onChange = vi.fn();
    render(<Choice schema={schema} value="a" onChange={onChange} />);
    fireEvent.change(screen.getByTestId('setting-mode'), { target: { value: 'c' } });
    expect(onChange).toHaveBeenCalledWith('c');
  });

  it('falls back to free text when editable and value is outside vallist', () => {
    render(<Choice schema={schema} value="custom" onChange={() => {}} editable />);
    const inp = screen.getByTestId('setting-mode') as HTMLInputElement;
    expect(inp.tagName).toBe('INPUT');
    expect(inp.value).toBe('custom');
  });
});
