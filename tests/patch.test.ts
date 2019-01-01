import { describe, it, expect } from 'vitest';
import { patch } from '../src/patch';
import { diff } from '../src/diff';
import { createElement } from '../src/createElement';
import { PatchType } from '../src/types';

describe('patch', () => {
  it('is a function', () => {
    expect(typeof patch).toBe('function');
  });

  it('accepts two arguments (element and patches)', () => {
    // patch(rootElement, patches) - expects 2 parameters
    expect(patch.length).toBe(2);
  });

  it('diff produces REPLACE patches for text changes within same element', () => {
    const a = createElement('p', {}, 'old text');
    const b = createElement('p', {}, 'new text');
    const patches = diff(a, b);
    expect(patches.length).toBeGreaterThan(0);
    // Top-level patch is UPDATE since the <p> tag is the same
    expect(patches[0].type).toBe(PatchType.UPDATE);
    if (patches[0].type === PatchType.UPDATE) {
      // The child patch should be a REPLACE for the changed text node
      expect(patches[0].childPatches.length).toBeGreaterThan(0);
      expect(patches[0].childPatches[0].patch.type).toBe(PatchType.REPLACE);
    }
  });

  it('diff produces UPDATE patches with propPatches for attribute changes', () => {
    const a = createElement('div', { className: 'old' });
    const b = createElement('div', { className: 'new', id: 'main' });
    const patches = diff(a, b);
    expect(patches.length).toBe(1);
    expect(patches[0].type).toBe(PatchType.UPDATE);
    if (patches[0].type === PatchType.UPDATE) {
      expect(patches[0].propPatches.length).toBeGreaterThan(0);
      const classNamePatch = patches[0].propPatches.find(p => p.key === 'className');
      expect(classNamePatch).toBeDefined();
      expect(classNamePatch!.value).toBe('new');
      const idPatch = patches[0].propPatches.find(p => p.key === 'id');
      expect(idPatch).toBeDefined();
      expect(idPatch!.value).toBe('main');
    }
  });

  it('diff produces CREATE child patches for added children', () => {
    const a = createElement('ul', {}, createElement('li', {}, 'one'));
    const b = createElement('ul', {},
      createElement('li', {}, 'one'),
      createElement('li', {}, 'two'),
    );
    const patches = diff(a, b);
    expect(patches.length).toBe(1);
    expect(patches[0].type).toBe(PatchType.UPDATE);
    if (patches[0].type === PatchType.UPDATE) {
      const createPatches = patches[0].childPatches.filter(
        cp => cp.patch.type === PatchType.CREATE
      );
      expect(createPatches.length).toBe(1);
    }
  });

  it('diff produces REMOVE child patches for removed children', () => {
    const a = createElement('ul', {},
      createElement('li', {}, 'one'),
      createElement('li', {}, 'two'),
    );
    const b = createElement('ul', {}, createElement('li', {}, 'one'));
    const patches = diff(a, b);
    expect(patches.length).toBe(1);
    expect(patches[0].type).toBe(PatchType.UPDATE);
    if (patches[0].type === PatchType.UPDATE) {
      const removePatches = patches[0].childPatches.filter(
        cp => cp.patch.type === PatchType.REMOVE
      );
      expect(removePatches.length).toBe(1);
    }
  });

  it('diff produces REPLACE patches for tag changes', () => {
    const a = createElement('div', {}, 'text');
    const b = createElement('span', {}, 'text');
    const patches = diff(a, b);
    expect(patches.length).toBe(1);
    expect(patches[0].type).toBe(PatchType.REPLACE);
  });
});
