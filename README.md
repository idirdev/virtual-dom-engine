# virtual-dom-engine

![TypeScript](https://img.shields.io/badge/TypeScript-4.1-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Educational-orange)

A virtual DOM implementation built from scratch in TypeScript for educational purposes. This project demonstrates the core concepts behind libraries like React: creating virtual node trees, diffing them, and patching the real DOM efficiently.

## How Virtual DOM Works

Traditional DOM manipulation is expensive. Every time you change something, the browser must recalculate layouts, repaint, and recompose. The virtual DOM pattern solves this:

1. **Create** - Build a lightweight JavaScript object tree (virtual DOM) that mirrors the real DOM structure
2. **Diff** - When state changes, create a new virtual tree and compare it with the previous one to find the minimum set of changes
3. **Patch** - Apply only those changes to the real DOM, minimizing expensive browser operations

```
State Change -> New VTree -> Diff(old, new) -> Patches -> Apply to Real DOM
```

### The Diffing Algorithm

The diffing engine compares two virtual trees node-by-node:

- **Different types?** Replace the entire subtree
- **Different tags?** Replace the element
- **Same tag?** Compare props and recurse into children
- **Keyed children?** Match by key for efficient reordering
- **Text nodes?** Simple string comparison

## Installation

```bash
npm install
npm run build
```

## API Reference

### `h(tag, props, ...children)` - Create Virtual Elements

Creates a virtual DOM node, similar to `React.createElement`.

```typescript
import { h } from 'virtual-dom-engine';

// Simple element
const div = h('div', { className: 'container' }, 'Hello World');

// Nested elements
const list = h('ul', null,
  h('li', { key: '1' }, 'Item 1'),
  h('li', { key: '2' }, 'Item 2'),
  h('li', { key: '3' }, 'Item 3'),
);

// With event handlers
const button = h('button', {
  onClick: () => console.log('clicked'),
  style: { backgroundColor: 'blue', color: 'white' },
}, 'Click Me');
```

### `text(value)` - Create Text Nodes

```typescript
import { text } from 'virtual-dom-engine';

const node = text('Hello');
```

### `render(vnode)` - Render to Real DOM

Converts a virtual node tree into real DOM nodes.

```typescript
import { h, render } from 'virtual-dom-engine';

const vnode = h('div', null, h('p', null, 'Hello'));
const element = render(vnode); // Returns an HTMLElement
document.body.appendChild(element);
```

### `diff(oldTree, newTree)` - Compute Differences

Compares two virtual trees and returns a list of patches.

```typescript
import { h, diff } from 'virtual-dom-engine';

const oldTree = h('div', null, h('p', null, 'Hello'));
const newTree = h('div', null, h('p', null, 'World'));

const patches = diff(oldTree, newTree);
// patches describes the minimum changes needed
```

### `patch(element, patches)` - Apply Changes

Applies computed patches to real DOM elements.

```typescript
import { h, render, diff, patch } from 'virtual-dom-engine';

const tree1 = h('div', null, 'Before');
const element = render(tree1) as HTMLElement;
document.body.appendChild(element);

const tree2 = h('div', null, 'After');
const patches = diff(tree1, tree2);
patch(element, patches); // DOM is now updated
```

### `Component` - Base Component Class

Abstract class for building stateful components with lifecycle hooks.

```typescript
import { Component, h, VNode } from 'virtual-dom-engine';

interface MyState {
  count: number;
}

class MyComponent extends Component<{}, MyState> {
  constructor() {
    super({});
    this.state = { count: 0 };
  }

  onMount() {
    console.log('Component mounted');
  }

  onUpdate(prevProps: {}, prevState: MyState) {
    console.log(`Count changed: ${prevState.count} -> ${this.state.count}`);
  }

  onUnmount() {
    console.log('Component unmounted');
  }

  render(): VNode {
    return h('div', null,
      h('span', null, `Count: ${this.state.count}`),
      h('button', {
        onClick: () => this.setState({ count: this.state.count + 1 }),
      }, 'Increment'),
    );
  }
}
```

### `App` - Application Container

Manages the top-level render cycle with event delegation and frame batching.

```typescript
import { App } from 'virtual-dom-engine';

const app = new App();
const root = document.getElementById('app')!;
app.mount(root, new MyComponent());

// Later, to clean up:
app.unmount();
```

## Patch Types

| Type      | Description                          |
|-----------|--------------------------------------|
| `CREATE`  | A new node needs to be added         |
| `REMOVE`  | An existing node needs to be removed |
| `REPLACE` | A node needs to be replaced entirely |
| `UPDATE`  | Props and/or children have changed   |
| `REORDER` | Children need to be reordered        |

## Examples

### Counter

A simple counter demonstrating state management and re-rendering:

```bash
# See examples/counter.ts
```

### Todo List

A complete todo application with add, remove, toggle, and filtering:

```bash
# See examples/todo.ts
```

## Project Structure

```
src/
  index.ts          - Public API exports
  types.ts          - TypeScript type definitions
  createElement.ts  - h() function for creating virtual nodes
  render.ts         - Renders virtual nodes to real DOM
  diff.ts           - Diffing algorithm comparing virtual trees
  patch.ts          - Applies patches to real DOM
  component.ts      - Base Component class with state & lifecycle
  app.ts            - App container with event delegation
examples/
  counter.ts        - Counter example
  todo.ts           - Todo list example
```

## Key Concepts Demonstrated

- **Virtual DOM tree construction** using a JSX-like `h()` function
- **Efficient tree diffing** with O(n) complexity per level
- **Keyed reconciliation** for list reordering without unnecessary re-creates
- **Batched updates** using `requestAnimationFrame` to coalesce state changes
- **Component lifecycle** hooks modeled after React class components
- **Event delegation** on the root element to minimize listener count
- **Boolean attribute handling** for HTML attributes like `disabled`, `checked`
- **Style diffing** with object-based inline styles

## License

MIT

## Performance

Benchmarks against React fiber and Preact coming soon.
