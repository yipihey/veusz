import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { StylesheetEditor } from './StylesheetEditor';
import { createRpc } from '../../rpc/client';
import { mockTransport } from '../../rpc/transport';

const STYLESHEET_SCHEMA = {
  typename: 'StyleSheet',
  mode: 'path' as const,
  name: 'StyleSheet',
  usertext: 'Stylesheet',
  descr: '',
  setnsmode: 'stylesheet',
  settings: [],
  subgroups: [
    {
      name: 'Line', usertext: 'Line', descr: '', setnsmode: 'formatting',
      settings: [
        {
          name: 'width', typename: 'distance', default: '0.5pt',
          descr: '', usertext: 'Width', formatting: true, hidden: false,
        },
        {
          name: 'color', typename: 'color', default: 'black',
          descr: '', usertext: 'Color', formatting: true, hidden: false,
        },
      ],
      subgroups: [],
    },
  ],
};

describe('StylesheetEditor', () => {
  it('fetches schema_at + values on mount and renders the Inspector', async () => {
    const rpc = createRpc(mockTransport({
      'doc.schema_at': () => STYLESHEET_SCHEMA,
      'doc.get': () => ({
        '/StyleSheet/Line/width': '1pt',
        '/StyleSheet/Line/color': 'black',
      }),
    }));
    render(<StylesheetEditor rpc={rpc} onChange={() => {}} />);
    await waitFor(() => screen.getByTestId('stylesheet-editor'));
    expect(screen.getByTestId('inspector')).toHaveAttribute('data-widget', '/StyleSheet');
    expect(within(screen.getByTestId('subgroup-Line')).getByTestId('row-width'))
      .toBeInTheDocument();
  });

  it('surfaces a schema_at error', async () => {
    const rpc = createRpc(mockTransport({
      'doc.schema_at': () => { throw new Error('no stylesheet'); },
    }));
    render(<StylesheetEditor rpc={rpc} onChange={() => {}} />);
    await waitFor(() => screen.getByTestId('stylesheet-error'));
    expect(screen.getByTestId('stylesheet-error')).toHaveTextContent('no stylesheet');
  });

  it('forwards onChange with the full /StyleSheet/... path', async () => {
    const onChange = vi.fn();
    const rpc = createRpc(mockTransport({
      'doc.schema_at': () => STYLESHEET_SCHEMA,
      'doc.get': () => ({
        '/StyleSheet/Line/width': '1pt',
        '/StyleSheet/Line/color': 'black',
      }),
    }));
    render(<StylesheetEditor rpc={rpc} onChange={onChange} />);
    await waitFor(() => screen.getByTestId('stylesheet-editor'));
    // Distance component renders a number input + unit select
    const numInput = within(screen.getByTestId('subgroup-Line'))
      .getByTestId('setting-width-num') as HTMLInputElement;
    fireEvent.change(numInput, { target: { value: '2' } });
    fireEvent.blur(numInput);
    expect(onChange).toHaveBeenCalledWith('/StyleSheet/Line/width', expect.stringMatching(/^2/));
  });
});
