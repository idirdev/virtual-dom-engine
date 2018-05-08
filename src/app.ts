import { Component } from './component';
import { VNode, Patch } from './types';
import { diff } from './diff';
import { patch } from './patch';
import { render } from './render';

/**
 * Application container that manages the top-level render cycle.
 * Handles mounting a component tree to a real DOM root, event delegation,
 * and requestAnimationFrame-based render batching.
 */
export class App {
  private rootEl: HTMLElement | null = null;
  private component: Component | null = null;
  private currentTree: VNode | null = null;
  private renderedRoot: HTMLElement | null = null;
  private pendingRender: boolean = false;
  private delegatedEvents: Map<string, EventListener> = new Map();

  /**
   * Mounts a component into a DOM container element.
   * Sets up event delegation on the root for common events.
   */
  mount(rootEl: HTMLElement, component: Component): void {
    this.rootEl = rootEl;
    this.component = component;

    // Clear the container
    while (rootEl.firstChild) {
      rootEl.removeChild(rootEl.firstChild);
    }

    // Mount the component
    this.renderedRoot = component._mount(rootEl);
    this.currentTree = component.render();

    // Set up event delegation for common events
    this.delegateEvent('click');
    this.delegateEvent('input');
    this.delegateEvent('change');
    this.delegateEvent('submit');
    this.delegateEvent('keydown');
    this.delegateEvent('keyup');
  }

  /**
   * Schedules a re-render using requestAnimationFrame for batching.
   * Multiple calls within the same frame result in a single render pass.
   */
  scheduleRender(): void {
    if (this.pendingRender) return;
    this.pendingRender = true;

    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => this.performRender());
    } else {
      Promise.resolve().then(() => this.performRender());
    }
  }

  /**
   * Performs the actual render: diffs the old and new trees, then patches the DOM.
   */
  private performRender(): void {
    this.pendingRender = false;

    if (!this.component || !this.renderedRoot || !this.currentTree) return;

    const newTree = this.component.render();
    const patches: Patch[] = diff(this.currentTree, newTree);

    if (patches.length > 0) {
      this.renderedRoot = patch(this.renderedRoot, patches);
    }

    this.currentTree = newTree;
  }

  /**
   * Sets up event delegation: attaches a single listener on the root element
   * that catches events bubbling up from any child. This avoids attaching
   * listeners to every individual element.
   */
  private delegateEvent(eventName: string): void {
    if (!this.rootEl || this.delegatedEvents.has(eventName)) return;

    const handler: EventListener = (event: Event) => {
      let target = event.target as HTMLElement | null;

      while (target && target !== this.rootEl) {
        const handlerAttr = `data-on${eventName}`;
        if (target.hasAttribute(handlerAttr)) {
          const handlerId = target.getAttribute(handlerAttr);
          // Delegate to registered handlers if using data attributes
          break;
        }
        target = target.parentElement;
      }
    };

    this.rootEl.addEventListener(eventName, handler, false);
    this.delegatedEvents.set(eventName, handler);
  }

  /**
   * Unmounts the current component and cleans up event delegation.
   */
  unmount(): void {
    if (this.component) {
      this.component._unmount();
    }

    // Remove delegated event listeners
    if (this.rootEl) {
      for (const [eventName, handler] of this.delegatedEvents) {
        this.rootEl.removeEventListener(eventName, handler);
      }
    }

    this.delegatedEvents.clear();
    this.component = null;
    this.currentTree = null;
    this.renderedRoot = null;
    this.rootEl = null;
  }
}
