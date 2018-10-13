import { describe, it, expect } from 'vitest';
import { patch } from '../src/patch';
import { diff } from '../src/diff';
import { createElement } from '../src/createElement';

describe('patch', () => {
  it('applies text patches', () => {
    const a = createElement('p', {}, ['old text']);
    const b = createElement('p', {}, ['new text']);
    const patches = diff(a, b);
    const result = patch(a, patches);
    expect(result.children[0]).toBe('new text');
  });

  it('applies prop patches', () => {
    const a = createElement('div', { className: 'old' });
    const b = createElement('div', { className: 'new', id: 'main' });
    const patches = diff(a, b);
    const result = patch(a, patches);
    expect(result.props.className).toBe('new');
    expect(result.props.id).toBe('main');
  });

  it('applies insert patches', () => {
    const a = createElement('ul', {}, [createElement('li', {}, ['one'])]);
    const b = createElement('ul', {}, [
      createElement('li', {}, ['one']),
      createElement('li', {}, ['two']),
    ]);
    const patches = diff(a, b);
    const result = patch(a, patches);
    expect(result.children).toHaveLength(2);
  });

  it('applies remove patches', () => {
    const a = createElement('ul', {}, [
      createElement('li', {}, ['one']),
      createElement('li', {}, ['two']),
    ]);
    const b = createElement('ul', {}, [createElement('li', {}, ['one'])]);
    const patches = diff(a, b);
    const result = patch(a, patches);
    expect(result.children).toHaveLength(1);
  });

  it('applies replace patches', () => {
    const a = createElement('div', {}, ['text']);
    const b = createElement('span', {}, ['text']);
    const patches = diff(a, b);
    const result = patch(a, patches);
    expect(result.tag).toBe('span');
  });
});
