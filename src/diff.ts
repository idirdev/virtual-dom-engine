import {
  VNode, VElement, VTextNode, Patch, PatchType,
  PropPatch, ChildPatch, ReorderMove,
} from './types';

/**
 * Computes the list of patches needed to transform oldTree into newTree.
 * This is the core diffing algorithm of the virtual DOM engine.
 */
export function diff(oldTree: VNode, newTree: VNode): Patch[] {
  const patches: Patch[] = [];

  diffNode(oldTree, newTree, patches);

  return patches;
}

/**
 * Compares two virtual nodes and records any differences as patches.
 */
function diffNode(oldNode: VNode, newNode: VNode, patches: Patch[]): void {
  // Nodes of different types -> full replacement
  if (oldNode.type !== newNode.type) {
    patches.push({ type: PatchType.REPLACE, newNode });
    return;
  }

  // Both are text nodes
  if (oldNode.type === 'text' && newNode.type === 'text') {
    if (oldNode.value !== newNode.value) {
      patches.push({ type: PatchType.REPLACE, newNode });
    }
    return;
  }

  // Both are element nodes
  const oldEl = oldNode as VElement;
  const newEl = newNode as VElement;

  // Different tags -> full replacement
  if (oldEl.tag !== newEl.tag) {
    patches.push({ type: PatchType.REPLACE, newNode: newEl });
    return;
  }

  // Same tag -> compute prop diff and children diff
  const propPatches = diffProps(oldEl.props, newEl.props);
  const childPatches = diffChildren(oldEl.children, newEl.children);

  if (propPatches.length > 0 || childPatches.length > 0) {
    patches.push({
      type: PatchType.UPDATE,
      propPatches,
      childPatches,
    });
  }
}

/**
 * Compares two props objects and returns a list of property-level patches.
 * Detects additions, changes, and removals.
 */
function diffProps(oldProps: Record<string, any>, newProps: Record<string, any>): PropPatch[] {
  const patches: PropPatch[] = [];
  const allKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);

  for (const key of allKeys) {
    const oldVal = oldProps[key];
    const newVal = newProps[key];

    if (key === 'style' && typeof oldVal === 'object' && typeof newVal === 'object') {
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        patches.push({ key, value: newVal, oldValue: oldVal });
      }
      continue;
    }

    if (!(key in newProps)) {
      // Property removed
      patches.push({ key, value: undefined, oldValue: oldVal });
    } else if (!(key in oldProps)) {
      // Property added
      patches.push({ key, value: newVal });
    } else if (oldVal !== newVal) {
      // Property changed
      patches.push({ key, value: newVal, oldValue: oldVal });
    }
  }

  return patches;
}

/**
 * Compares two children arrays using keyed diffing when keys are present,
 * falling back to index-based comparison otherwise.
 */
function diffChildren(oldChildren: VNode[], newChildren: VNode[]): ChildPatch[] {
  const childPatches: ChildPatch[] = [];

  const oldKeyed = getKeyedMap(oldChildren);
  const newKeyed = getKeyedMap(newChildren);
  const useKeyedDiff = oldKeyed.size > 0 || newKeyed.size > 0;

  if (useKeyedDiff) {
    // Keyed diff: match children by key
    const maxLen = Math.max(oldChildren.length, newChildren.length);
    for (let i = 0; i < maxLen; i++) {
      if (i >= oldChildren.length) {
        childPatches.push({ index: i, patch: { type: PatchType.CREATE, newNode: newChildren[i] } });
      } else if (i >= newChildren.length) {
        childPatches.push({ index: i, patch: { type: PatchType.REMOVE, index: i } });
      } else {
        const oldKey = getNodeKey(oldChildren[i]);
        const newKey = getNodeKey(newChildren[i]);

        if (oldKey !== newKey) {
          // Keys differ: replace
          childPatches.push({ index: i, patch: { type: PatchType.REPLACE, newNode: newChildren[i] } });
        } else {
          // Same key: recurse
          const subPatches: Patch[] = [];
          diffNode(oldChildren[i], newChildren[i], subPatches);
          for (const p of subPatches) {
            childPatches.push({ index: i, patch: p });
          }
        }
      }
    }
  } else {
    // Simple index-based diff
    const maxLen = Math.max(oldChildren.length, newChildren.length);
    for (let i = 0; i < maxLen; i++) {
      if (i >= oldChildren.length) {
        childPatches.push({ index: i, patch: { type: PatchType.CREATE, newNode: newChildren[i] } });
      } else if (i >= newChildren.length) {
        childPatches.push({ index: i, patch: { type: PatchType.REMOVE, index: i } });
      } else {
        const subPatches: Patch[] = [];
        diffNode(oldChildren[i], newChildren[i], subPatches);
        for (const p of subPatches) {
          childPatches.push({ index: i, patch: p });
        }
      }
    }
  }

  return childPatches;
}

/** Builds a map of key -> index for keyed children */
function getKeyedMap(children: VNode[]): Map<string | number, number> {
  const map = new Map<string | number, number>();
  for (let i = 0; i < children.length; i++) {
    const key = getNodeKey(children[i]);
    if (key !== undefined) {
      map.set(key, i);
    }
  }
  return map;
}

/** Extracts the key from a virtual node, if it has one */
function getNodeKey(node: VNode): string | number | undefined {
  if (node.type === 'element') {
    return node.key ?? node.props.key;
  }
  return undefined;
}
