import { describe, it, expect } from 'vitest';
import { render, setProps, removeProp } from '../src/render';
import { createElement } from '../src/createElement';

describe('render', () => {
  it('is a function', () => {
    expect(typeof render).toBe('function');
  });

  it('accepts one argument (vnode)', () => {
    expect(render.length).toBe(1);
  });

  it('setProps is a function', () => {
    expect(typeof setProps).toBe('function');
  });

  it('removeProp is a function', () => {
    expect(typeof removeProp).toBe('function');
  });

  it('createElement produces valid vnodes for render consumption', () => {
    const vnode = createElement('div', { id: 'app' });
    expect(vnode.type).toBe('element');
    expect(vnode.tag).toBe('div');
    expect(vnode.props.id).toBe('app');
  });

  it('createElement produces nested vnodes for render consumption', () => {
    const vnode = createElement('div', {},
      createElement('h1', {}, 'title'),
      createElement('p', {}, 'content'),
    );
    expect(vnode.type).toBe('element');
    expect(vnode.children).toHaveLength(2);
    const h1 = vnode.children[0];
    expect(h1.type).toBe('element');
    if (h1.type === 'element') {
      expect(h1.tag).toBe('h1');
    }
  });

  it('createElement with className prop creates valid vnode', () => {
    const vnode = createElement('div', { className: 'container' });
    expect(vnode.props.className).toBe('container');
  });

  it('text children are converted to text nodes', () => {
    const vnode = createElement('p', {}, 'hello');
    expect(vnode.children).toHaveLength(1);
    expect(vnode.children[0]).toEqual({ type: 'text', value: 'hello' });
  });
});
