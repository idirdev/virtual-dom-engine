import { describe, it, expect } from 'vitest';
import { render } from '../src/render';
import { createElement } from '../src/createElement';

describe('render', () => {
  it('renders simple element', () => {
    const vnode = createElement('div', { id: 'app' });
    const el = render(vnode);
    expect(el.tagName).toBe('DIV');
  });

  it('renders text children', () => {
    const vnode = createElement('p', {}, ['hello']);
    const el = render(vnode);
    expect(el.textContent).toBe('hello');
  });

  it('renders nested elements', () => {
    const vnode = createElement('div', {}, [
      createElement('h1', {}, ['title']),
      createElement('p', {}, ['content']),
    ]);
    const el = render(vnode);
    expect(el.children).toHaveLength(2);
  });

  it('applies class names', () => {
    const vnode = createElement('div', { className: 'container' });
    const el = render(vnode);
    expect(el.className).toBe('container');
  });
});
