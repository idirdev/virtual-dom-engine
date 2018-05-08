import { VNode, Props, Patch } from './types';
import { diff } from './diff';
import { patch } from './patch';
import { render } from './render';

/**
 * Abstract base class for virtual DOM components.
 * Provides state management, lifecycle hooks, and automatic re-rendering.
 */
export abstract class Component<P extends Props = Props, S extends object = object> {
  public props: P;
  protected state: S;
  private _mounted: boolean = false;
  private _element: HTMLElement | null = null;
  private _currentTree: VNode | null = null;
  private _pendingState: Partial<S> | null = null;
  private _updateScheduled: boolean = false;

  constructor(props: P) {
    this.props = props;
    this.state = {} as S;
  }

  /**
   * Must be implemented by subclasses. Returns the virtual DOM tree for this component.
   */
  abstract render(): VNode;

  /**
   * Merges partial state into the current state and schedules a re-render.
   * Multiple setState calls within the same frame are batched together.
   */
  setState(partial: Partial<S>): void {
    this._pendingState = {
      ...(this._pendingState || {}),
      ...partial,
    };

    if (!this._updateScheduled) {
      this._updateScheduled = true;
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => this._flushUpdate());
      } else {
        Promise.resolve().then(() => this._flushUpdate());
      }
    }
  }

  /**
   * Called after the component is first mounted to the DOM.
   * Override to set up subscriptions, timers, or fetch data.
   */
  onMount(): void {}

  /**
   * Called after every re-render (not the initial mount).
   * Override to react to state/prop changes.
   */
  onUpdate(prevProps: P, prevState: S): void {}

  /**
   * Called when the component is removed from the DOM.
   * Override to clean up subscriptions, timers, or listeners.
   */
  onUnmount(): void {}

  /**
   * Determines if the component should re-render given new props and state.
   * Default does a shallow inequality check. Override for custom logic.
   */
  shouldUpdate(nextProps: P, nextState: S): boolean {
    return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
  }

  /** @internal Mounts the component to a DOM element */
  _mount(container: HTMLElement): HTMLElement {
    this._currentTree = this.render();
    this._element = render(this._currentTree) as HTMLElement;
    container.appendChild(this._element);
    this._mounted = true;
    this.onMount();
    return this._element;
  }

  /** @internal Unmounts the component */
  _unmount(): void {
    this._mounted = false;
    this.onUnmount();
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }
    this._element = null;
    this._currentTree = null;
  }

  /** @internal Flushes pending state updates and re-renders if needed */
  private _flushUpdate(): void {
    this._updateScheduled = false;

    if (!this._mounted || !this._pendingState || !this._element || !this._currentTree) {
      this._pendingState = null;
      return;
    }

    const prevState = { ...this.state };
    const prevProps = { ...this.props };
    const nextState = { ...this.state, ...this._pendingState } as S;
    this._pendingState = null;

    if (!this.shouldUpdate(this.props, nextState)) {
      return;
    }

    this.state = nextState;
    const newTree = this.render();
    const patches: Patch[] = diff(this._currentTree, newTree);

    if (patches.length > 0) {
      this._element = patch(this._element, patches);
    }

    this._currentTree = newTree;
    this.onUpdate(prevProps, prevState);
  }
}

/**
 * Performs a shallow comparison of two objects.
 * Returns true if all top-level keys have the same values.
 */
function shallowEqual(a: Record<string, any>, b: Record<string, any>): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }

  return true;
}
