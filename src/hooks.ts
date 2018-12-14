type StateUpdater<T> = (newValue: T | ((prev: T) => T)) => void;
type EffectCleanup = void | (() => void);
type EffectFn = () => EffectCleanup;

interface HookState {
  states: any[];
  effects: { fn: EffectFn; deps: any[] | undefined; cleanup?: EffectCleanup }[];
  stateIndex: number;
  effectIndex: number;
}

let currentHooks: HookState | null = null;

export function setCurrentHooks(hooks: HookState) {
  currentHooks = hooks;
  hooks.stateIndex = 0;
  hooks.effectIndex = 0;
}

export function clearCurrentHooks() { currentHooks = null; }
export function createHookState(): HookState {
  return { states: [], effects: [], stateIndex: 0, effectIndex: 0 };
}

export function useState<T>(initial: T): [T, StateUpdater<T>] {
  if (!currentHooks) throw new Error('useState outside component');
  const hooks = currentHooks;
  const idx = hooks.stateIndex++;
  if (idx >= hooks.states.length) hooks.states.push(initial);
  const set: StateUpdater<T> = (v) => {
    hooks.states[idx] = typeof v === 'function' ? (v as Function)(hooks.states[idx]) : v;
  };
  return [hooks.states[idx], set];
}

function depsChanged(a: any[] | undefined, b: any[] | undefined): boolean {
  if (!a || !b || a.length !== b.length) return true;
  return a.some((d, i) => !Object.is(d, b[i]));
}

export function useEffect(fn: EffectFn, deps?: any[]) {
  if (!currentHooks) throw new Error('useEffect outside component');
  const hooks = currentHooks;
  const idx = hooks.effectIndex++;
  const existing = hooks.effects[idx];
  if (!existing || depsChanged(existing.deps, deps)) {
    if (existing?.cleanup) existing.cleanup();
    hooks.effects[idx] = { fn, deps, cleanup: undefined };
  }
}

export function runEffects(hooks: HookState) {
  for (const e of hooks.effects) {
    if (e.cleanup === undefined) e.cleanup = e.fn() || undefined;
  }
}
