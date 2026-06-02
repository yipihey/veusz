import { describe, it, expect, afterEach } from 'vitest';
import { displayDpr, setDisplayDprOverride, BASE_DPI } from './dpi';

afterEach(() => setDisplayDprOverride(null));

describe('displayDpr', () => {
  it('respects an explicit override', () => {
    setDisplayDprOverride(2.5);
    expect(displayDpr()).toBe(2.5);
  });

  it('clamps the override to [1, 3]', () => {
    setDisplayDprOverride(0.5);
    expect(displayDpr()).toBe(1);
    setDisplayDprOverride(5);
    expect(displayDpr()).toBe(3);
  });

  it('falls back to window.devicePixelRatio when no override is set', () => {
    const orig = window.devicePixelRatio;
    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true, value: 2,
    });
    try {
      setDisplayDprOverride(null);
      expect(displayDpr()).toBe(2);
    } finally {
      Object.defineProperty(window, 'devicePixelRatio', {
        configurable: true, value: orig,
      });
    }
  });

  it('treats invalid override values as no override', () => {
    setDisplayDprOverride(NaN);
    // No override → fall through to window.devicePixelRatio (= 1 in JSDOM).
    expect(displayDpr()).toBe(1);
    setDisplayDprOverride(-1);
    expect(displayDpr()).toBe(1);
  });

  it('exposes BASE_DPI = 96 for callers that scale by dpr', () => {
    expect(BASE_DPI).toBe(96);
  });
});
