import { describe, it, expect, vi } from 'vitest';
import { useState, useEffect, createHookState, setCurrentHooks, clearCurrentHooks, runEffects } from '../src/hooks';

describe('hooks', () => {
  describe('useState', () => {
    it('returns initial value', () => {
      const hooks = createHookState();
      setCurrentHooks(hooks);
      const [val] = useState(42);
      expect(val).toBe(42);
      clearCurrentHooks();
    });
    it('updates with direct value', () => {
      const hooks = createHookState();
      setCurrentHooks(hooks);
      const [, set] = useState(0);
      set(5);
      setCurrentHooks(hooks);
      const [val] = useState(0);
      expect(val).toBe(5);
      clearCurrentHooks();
    });
    it('updates with function', () => {
      const hooks = createHookState();
      setCurrentHooks(hooks);
      const [, set] = useState(10);
      set((p: number) => p + 5);
      setCurrentHooks(hooks);
      const [val] = useState(0);
      expect(val).toBe(15);
      clearCurrentHooks();
    });
  });
  describe('useEffect', () => {
    it('runs effect', () => {
      const hooks = createHookState();
      const fn = vi.fn();
      setCurrentHooks(hooks);
      useEffect(fn);
      runEffects(hooks);
      expect(fn).toHaveBeenCalledTimes(1);
      clearCurrentHooks();
    });
  });
});
