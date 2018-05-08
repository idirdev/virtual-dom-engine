import { Patch, PatchType, PropPatch, ChildPatch } from './types';
import { render, setProps, removeProp } from './render';

/**
 * Applies a list of patches to a real DOM element tree.
 * This is the second half of the virtual DOM cycle: diff -> patch.
 */
export function patch(rootElement: HTMLElement, patches: Patch[]): HTMLElement {
  for (const p of patches) {
    applyPatch(rootElement, p);
  }
  return rootElement;
}

/**
 * Applies a single patch to a DOM element, dispatching by patch type.
 */
function applyPatch(element: HTMLElement, p: Patch): void {
  switch (p.type) {
    case PatchType.CREATE:
      applyCreate(element, p.newNode);
      break;

    case PatchType.REMOVE:
      applyRemove(element, p.index);
      break;

    case PatchType.REPLACE:
      applyReplace(element, p.newNode);
      break;

    case PatchType.UPDATE:
      applyUpdate(element, p.propPatches, p.childPatches);
      break;

    case PatchType.REORDER:
      applyReorder(element, p.moves);
      break;
  }
}

/**
 * Creates and appends a new child node from a virtual node.
 */
function applyCreate(parent: HTMLElement, vnode: any): void {
  const newNode = render(vnode);
  parent.appendChild(newNode);
}

/**
 * Removes a child at the given index from the parent element.
 */
function applyRemove(parent: HTMLElement, index: number): void {
  const child = parent.childNodes[index];
  if (child) {
    parent.removeChild(child);
  }
}

/**
 * Replaces the current element with a newly rendered virtual node.
 * If the element has a parent, it performs an in-place replacement.
 */
function applyReplace(element: HTMLElement, vnode: any): void {
  const newNode = render(vnode);
  const parent = element.parentNode;
  if (parent) {
    parent.replaceChild(newNode, element);
  }
}

/**
 * Applies prop patches and child patches to an existing element.
 * Props are updated first, then children are patched recursively.
 */
function applyUpdate(element: HTMLElement, propPatches: PropPatch[], childPatches: ChildPatch[]): void {
  // Apply property changes
  for (const pp of propPatches) {
    if (pp.value === undefined) {
      removeProp(element, pp.key, pp.oldValue);
    } else if (pp.key === 'style' && typeof pp.value === 'object') {
      // Clear old styles and apply new ones
      element.removeAttribute('style');
      for (const [prop, val] of Object.entries(pp.value)) {
        if (val !== undefined && val !== null) {
          (element.style as any)[prop] = val;
        }
      }
    } else if (pp.key.startsWith('on') && typeof pp.oldValue === 'function') {
      const eventName = pp.key.slice(2).toLowerCase();
      element.removeEventListener(eventName, pp.oldValue);
      if (typeof pp.value === 'function') {
        element.addEventListener(eventName, pp.value);
      }
    } else {
      setProps(element, { [pp.key]: pp.value });
    }
  }

  // Apply child patches (process removals in reverse order to preserve indices)
  const removals: ChildPatch[] = [];
  const others: ChildPatch[] = [];

  for (const cp of childPatches) {
    if (cp.patch.type === PatchType.REMOVE) {
      removals.push(cp);
    } else {
      others.push(cp);
    }
  }

  // Sort removals by index descending so earlier indices stay valid
  removals.sort((a, b) => b.index - a.index);

  for (const cp of removals) {
    applyRemove(element, cp.index);
  }

  for (const cp of others) {
    const childEl = element.childNodes[cp.index] as HTMLElement | undefined;
    if (cp.patch.type === PatchType.CREATE) {
      applyCreate(element, (cp.patch as any).newNode);
    } else if (childEl) {
      applyPatch(childEl, cp.patch);
    }
  }
}

/**
 * Applies reorder moves to rearrange child elements efficiently.
 */
function applyReorder(parent: HTMLElement, moves: { from: number; to: number; item?: any }[]): void {
  const children = Array.from(parent.childNodes);

  for (const move of moves) {
    const node = children[move.from];
    if (!node) continue;

    if (move.to >= parent.childNodes.length) {
      parent.appendChild(node);
    } else {
      const refNode = parent.childNodes[move.to];
      if (refNode && refNode !== node) {
        parent.insertBefore(node, refNode);
      }
    }
  }
}
