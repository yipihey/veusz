import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemePicker } from './ThemePicker';
import type { ThemeInfo } from '../rpc/types';

const THEMES: ThemeInfo[] = [
  { id: 'default', label: 'Veusz Default', description: 'Out of the box.',
    palette: ['#e41a1c', '#377eb8'], colorTheme: 'default-latest',
    font: 'Times New Roman', fg: '#000000', bg: '#ffffff' },
  { id: 'dark', label: 'Dark', description: 'Light on dark.',
    palette: ['#377eb8', '#4daf4a'], colorTheme: 'default1',
    font: 'Helvetica', fg: '#e6e6e6', bg: '#1e1e1e' },
];

describe('ThemePicker', () => {
  it('renders nothing without themes', () => {
    const { container } = render(<ThemePicker themes={[]} onApply={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('opens the panel and applies the chosen theme', () => {
    const onApply = vi.fn();
    render(<ThemePicker themes={THEMES} onApply={onApply} />);

    // panel closed initially
    expect(screen.queryByTestId('theme-picker-panel')).toBeNull();

    fireEvent.click(screen.getByTestId('theme-picker-trigger'));
    expect(screen.getByTestId('theme-picker-panel')).toBeTruthy();
    // both themes listed
    expect(screen.getByTestId('theme-opt-default')).toBeTruthy();
    expect(screen.getByTestId('theme-opt-dark')).toBeTruthy();

    fireEvent.click(screen.getByTestId('theme-opt-dark'));
    expect(onApply).toHaveBeenCalledWith('dark');
    // panel closes after a choice
    expect(screen.queryByTestId('theme-picker-panel')).toBeNull();
  });

  it('does not fire when disabled (no panel opens)', () => {
    const onApply = vi.fn();
    render(<ThemePicker themes={THEMES} onApply={onApply} disabled />);
    fireEvent.click(screen.getByTestId('theme-picker-trigger'));
    expect(screen.queryByTestId('theme-picker-panel')).toBeNull();
    expect(onApply).not.toHaveBeenCalled();
  });
});
