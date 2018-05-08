import { VNode, VElement, VTextNode, Props } from './types';

/** Set of HTML attributes that are boolean (present or absent, no value needed) */
const BOOLEAN_ATTRS = new Set([
  'disabled', 'checked', 'readonly', 'required', 'autofocus',
  'multiple', 'selected', 'hidden', 'novalidate', 'autoplay',
  'controls', 'loop', 'muted', 'open', 'spellcheck',
]);

/**
 * Renders a virtual node tree into a real DOM node.
 * Recursively creates elements, sets attributes, and appends children.
 */
export function render(vnode: VNode): Node {
  if (vnode.type === 'text') {
    return document.createTextNode(vnode.value);
  }

  const el = document.createElement(vnode.tag);

  setProps(el, vnode.props);

  for (const child of vnode.children) {
    const childNode = render(child);
    el.appendChild(childNode);
  }

  return el;
}

/**
 * Applies all props to a real DOM element: attributes, event listeners, styles, class.
 */
export function setProps(el: HTMLElement, props: Props): void {
  for (const [key, value] of Object.entries(props)) {
    if (key === 'key') continue;

    if (key === 'style' && typeof value === 'object') {
      setStyles(el, value as Partial<CSSStyleDeclaration>);
    } else if (key === 'className') {
      el.setAttribute('class', value as string);
    } else if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, value as EventListener);
    } else if (BOOLEAN_ATTRS.has(key)) {
      if (value) {
        el.setAttribute(key, '');
        (el as any)[key] = true;
      } else {
        el.removeAttribute(key);
        (el as any)[key] = false;
      }
    } else if (key === 'value') {
      (el as HTMLInputElement).value = value as string;
    } else if (value !== false && value !== null && value !== undefined) {
      el.setAttribute(key, String(value));
    }
  }
}

/**
 * Applies inline styles from an object to a DOM element.
 */
function setStyles(el: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
  for (const [prop, value] of Object.entries(styles)) {
    if (value !== undefined && value !== null) {
      (el.style as any)[prop] = value;
    }
  }
}

/**
 * Removes a single prop from a DOM element (attribute, event listener, or style).
 */
export function removeProp(el: HTMLElement, key: string, oldValue: any): void {
  if (key === 'key') return;

  if (key === 'style') {
    el.removeAttribute('style');
  } else if (key === 'className') {
    el.removeAttribute('class');
  } else if (key.startsWith('on') && typeof oldValue === 'function') {
    const eventName = key.slice(2).toLowerCase();
    el.removeEventListener(eventName, oldValue as EventListener);
  } else if (BOOLEAN_ATTRS.has(key)) {
    el.removeAttribute(key);
    (el as any)[key] = false;
  } else {
    el.removeAttribute(key);
  }
}
