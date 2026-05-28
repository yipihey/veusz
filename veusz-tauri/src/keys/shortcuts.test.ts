/**
 * Keyboard shortcut classifier + dispatcher tests.
 *
 * The `useKeyboardShortcuts` hook is a thin wrapper; the
 * interesting logic lives in `classify` (event -> action) and
 * `dispatch` (action -> store call). We test those directly.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  classify,
  dispatch,
  eventToShortcut,
  isEditableTarget,
} from './shortcuts';

function ev(opts: Partial<KeyboardEvent>): KeyboardEvent {
  // Minimal stub for the shape we read.
  return {
    key: '',
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    ...opts,
  } as KeyboardEvent;
}

describe('classify', () => {
  it('maps Ctrl+C to copy', () => {
    expect(classify(eventToShortcut(ev({ key: 'c', ctrlKey: true }))))
      .toBe('copy');
  });

  it('maps Cmd+C (macOS) to copy', () => {
    expect(classify(eventToShortcut(ev({ key: 'c', metaKey: true }))))
      .toBe('copy');
  });

  it('maps Ctrl+Alt+C to copyAsImage', () => {
    expect(classify(eventToShortcut(ev({ key: 'c', ctrlKey: true, altKey: true }))))
      .toBe('copyAsImage');
  });

  it('maps Ctrl+X to cut and Ctrl+V to paste', () => {
    expect(classify(eventToShortcut(ev({ key: 'x', ctrlKey: true })))).toBe('cut');
    expect(classify(eventToShortcut(ev({ key: 'v', ctrlKey: true })))).toBe('paste');
  });

  it('maps Delete and Backspace to delete', () => {
    expect(classify(eventToShortcut(ev({ key: 'Delete' })))).toBe('delete');
    expect(classify(eventToShortcut(ev({ key: 'Backspace' })))).toBe('delete');
  });

  it('maps Ctrl+Z to undo, Ctrl+Y to redo, Ctrl+Shift+Z to redo', () => {
    expect(classify(eventToShortcut(ev({ key: 'z', ctrlKey: true })))).toBe('undo');
    expect(classify(eventToShortcut(ev({ key: 'y', ctrlKey: true })))).toBe('redo');
    expect(classify(eventToShortcut(ev({ key: 'z', ctrlKey: true, shiftKey: true }))))
      .toBe('redo');
  });

  it('maps Ctrl+] / Ctrl+[ to show / hide', () => {
    expect(classify(eventToShortcut(ev({ key: ']', ctrlKey: true })))).toBe('show');
    expect(classify(eventToShortcut(ev({ key: '[', ctrlKey: true })))).toBe('hide');
  });

  it('maps Ctrl+Shift+PageUp / PageDown to move', () => {
    expect(classify(eventToShortcut(ev({
      key: 'PageUp', ctrlKey: true, shiftKey: true,
    })))).toBe('moveUp');
    expect(classify(eventToShortcut(ev({
      key: 'PageDown', ctrlKey: true, shiftKey: true,
    })))).toBe('moveDown');
  });

  it('maps F2 to rename', () => {
    expect(classify(eventToShortcut(ev({ key: 'F2' })))).toBe('rename');
  });

  it('returns null for unrelated key combos', () => {
    expect(classify(eventToShortcut(ev({ key: 'a' })))).toBeNull();
    expect(classify(eventToShortcut(ev({ key: 'c', shiftKey: true }))))
      .toBeNull();
  });
});

describe('isEditableTarget', () => {
  it('returns true for input/textarea/select', () => {
    expect(isEditableTarget(document.createElement('input'))).toBe(true);
    expect(isEditableTarget(document.createElement('textarea'))).toBe(true);
    expect(isEditableTarget(document.createElement('select'))).toBe(true);
  });
  it('returns true for contentEditable=true', () => {
    // Mock the property — happy-dom doesn't always reflect
    // contentEditable='true' into the live `isContentEditable` getter,
    // but the production code branch is exercised here.
    const div = document.createElement('div');
    Object.defineProperty(div, 'isContentEditable', { value: true });
    expect(isEditableTarget(div)).toBe(true);
  });
  it('returns false for a regular div', () => {
    expect(isEditableTarget(document.createElement('div'))).toBe(false);
  });
  it('returns false for null', () => {
    expect(isEditableTarget(null)).toBe(false);
  });
});

// --- dispatch routing ------------------------------------------------------

function fakeStore(selected: string[]) {
  const calls: Array<[string, ...unknown[]]> = [];
  const trk = (name: string) => (...args: unknown[]) => {
    calls.push([name, ...args]);
    return Promise.resolve();
  };
  const state = {
    selected,
    render: { width: 800, height: 600 },
    undo: trk('undo'),
    redo: trk('redo'),
    cutWidgets: trk('cutWidgets'),
    copyWidgets: trk('copyWidgets'),
    pasteWidgets: trk('pasteWidgets'),
    copyWidgetAsImage: trk('copyWidgetAsImage'),
    removeWidget: trk('removeWidget'),
    setHidden: trk('setHidden'),
    moveWidget: trk('moveWidget'),
  };
  return {
    calls,
    store: { getState: () => state } as unknown as Parameters<typeof dispatch>[1],
  };
}

describe('dispatch', () => {
  it('cut/copy/paste/delete/hide/show/move route with selected path', async () => {
    const f = fakeStore(['/page1/graph1']);
    await dispatch('cut', f.store);
    await dispatch('copy', f.store);
    await dispatch('paste', f.store);
    await dispatch('delete', f.store);
    await dispatch('hide', f.store);
    await dispatch('show', f.store);
    await dispatch('moveUp', f.store);
    await dispatch('moveDown', f.store);
    expect(f.calls.map((c) => c[0])).toEqual([
      'cutWidgets',
      'copyWidgets',
      'pasteWidgets',
      'removeWidget',
      'setHidden',
      'setHidden',
      'moveWidget',
      'moveWidget',
    ]);
  });

  it('undo / redo / copyAsImage do not require a selection', async () => {
    const f = fakeStore([]);
    await dispatch('undo', f.store);
    await dispatch('redo', f.store);
    await dispatch('copyAsImage', f.store);
    expect(f.calls.map((c) => c[0])).toEqual(['undo', 'redo', 'copyWidgetAsImage']);
  });

  it('most actions are no-ops without a selection', async () => {
    const f = fakeStore([]);
    await dispatch('cut', f.store);
    await dispatch('copy', f.store);
    await dispatch('delete', f.store);
    await dispatch('hide', f.store);
    await dispatch('moveUp', f.store);
    expect(f.calls).toHaveLength(0);
  });

  it('cut/copy/delete act on the whole multi-selection', async () => {
    const f = fakeStore(['/page1/graph1/x', '/page1/graph1/y']);
    await dispatch('cut', f.store);
    expect(f.calls[0]).toEqual(['cutWidgets', ['/page1/graph1/x', '/page1/graph1/y']]);
    await dispatch('delete', f.store);
    // delete maps over the selection -> one removeWidget per path.
    const removes = f.calls.filter((c) => c[0] === 'removeWidget');
    expect(removes).toHaveLength(2);
  });

  it('rename is a no-op (intent emitted, no store action)', async () => {
    const f = fakeStore(['/page1']);
    await dispatch('rename', f.store);
    expect(f.calls).toHaveLength(0);
  });
});

// Quiet vitest about unused vi import:
void vi;
