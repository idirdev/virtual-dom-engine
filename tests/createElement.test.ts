import { describe, it, expect } from 'vitest';
import { createElement, h } from '../src/createElement';

describe('createElement', () => {
  it('creates a vnode with tag', () => {
    const node = createElement('div');
    expect(node.tag).toBe('div');
    expect(node.children).toEqual([]);
  });

  it('creates a vnode with props', () => {
    const node = createElement('div', { id: 'app', className: 'container' });
    expect(node.props.id).toBe('app');
    expect(node.props.className).toBe('container');
  });

  it('creates a vnode with children', () => {
    const child = createElement('span', {}, ['hello']);
    const parent = createElement('div', {}, [child]);
    expect(parent.children).toHaveLength(1);
    expect(parent.children[0]).toBe(child);
  });

  it('handles text children', () => {
    const node = createElement('p', {}, ['hello world']);
    expect(node.children[0]).toBe('hello world');
  });

  it('handles nested children', () => {
    const node = createElement('ul', {}, [
      createElement('li', {}, ['item 1']),
      createElement('li', {}, ['item 2']),
      createElement('li', {}, ['item 3']),
    ]);
    expect(node.children).toHaveLength(3);
  });

  it('handles null/undefined props', () => {
    const node = createElement('div', null);
    expect(node.props).toBeDefined();
  });

  it('handles empty props', () => {
    const node = createElement('div', {});
    expect(Object.keys(node.props)).toHaveLength(0);
  });

  it('h is an alias for createElement', () => {
    expect(h).toBe(createElement);
  });
});
