import { VNode, VElement, VTextNode, Props } from './types';

/**
 * Creates a virtual DOM element node (similar to React.createElement).
 * Handles strings/numbers as text nodes and flattens nested children arrays.
 */
export function h(tag: string, props: Props | null, ...children: any[]): VElement {
  const flatChildren = flattenChildren(children);
  const resolvedProps: Props = props ?? {};

  const vElement: VElement = {
    type: 'element',
    tag,
    props: resolvedProps,
    children: flatChildren,
  };

  if (resolvedProps.key !== undefined) {
    vElement.key = resolvedProps.key;
  }

  return vElement;
}

/**
 * Creates a virtual text node from a string value.
 */
export function text(value: string): VTextNode {
  return { type: 'text', value };
}

/**
 * Recursively flattens children arrays and converts primitives to text nodes.
 * Filters out null, undefined, and boolean values (like React).
 */
function flattenChildren(children: any[]): VNode[] {
  const result: VNode[] = [];

  for (const child of children) {
    if (child === null || child === undefined || typeof child === 'boolean') {
      continue;
    }
    if (Array.isArray(child)) {
      result.push(...flattenChildren(child));
    } else if (typeof child === 'string') {
      result.push(text(child));
    } else if (typeof child === 'number') {
      result.push(text(String(child)));
    } else {
      result.push(child as VNode);
    }
  }

  return result;
}
