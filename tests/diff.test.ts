import { describe, it, expect } from 'vitest';
import { diff } from '../src/diff';
import { createElement } from '../src/createElement';
import { PatchType } from '../src/types';

describe('diff', () => {
  it('detects no changes for identical trees', () => {
    const a = createElement('div', { id: 'app' }, 'hello');
    const b = createElement('div', { id: 'app' }, 'hello');
    const patches = diff(a, b);
    expect(patches).toHaveLength(0);
  });

  it('detects text content changes', () => {
    const a = createElement('p', {}, 'hello');
    const b = createElement('p', {}, 'world');
    const patches = diff(a, b);
    expect(patches.length).toBeGreaterThan(0);
    // Text change within same tag produces an UPDATE patch at top level
    expect(patches.some((p) => p.type === PatchType.UPDATE)).toBe(true);
  });

  it('detects attribute changes', () => {
    const a = createElement('div', { className: 'old' });
    const b = createElement('div', { className: 'new' });
    const patches = diff(a, b);
    expect(patches.some((p) => p.type === PatchType.UPDATE)).toBe(true);
  });

  it('detects added children', () => {
    const a = createElement('ul', {}, createElement('li', {}, 'one'));
    const b = createElement('ul', {},
      createElement('li', {}, 'one'),
      createElement('li', {}, 'two'),
    );
    const patches = diff(a, b);
    // Added children produce an UPDATE patch with CREATE child patches
    expect(patches.some((p) => p.type === PatchType.UPDATE)).toBe(true);
  });

  it('detects removed children', () => {
    const a = createElement('ul', {},
      createElement('li', {}, 'one'),
      createElement('li', {}, 'two'),
    );
    const b = createElement('ul', {}, createElement('li', {}, 'one'));
    const patches = diff(a, b);
    // Removed children produce an UPDATE patch with REMOVE child patches
    expect(patches.some((p) => p.type === PatchType.UPDATE)).toBe(true);
  });

  it('detects tag replacement', () => {
    const a = createElement('div');
    const b = createElement('span');
    const patches = diff(a, b);
    expect(patches.some((p) => p.type === PatchType.REPLACE)).toBe(true);
  });

  it('handles deeply nested changes', () => {
    const a = createElement('div', {},
      createElement('div', {}, createElement('span', {}, 'deep')),
    );
    const b = createElement('div', {},
      createElement('div', {}, createElement('span', {}, 'changed')),
    );
    const patches = diff(a, b);
    expect(patches.length).toBeGreaterThan(0);
  });
});
