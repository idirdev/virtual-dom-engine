import { Component, h, App, VNode } from '../src';

interface CounterState {
  count: number;
}

/**
 * A simple counter component demonstrating setState and re-rendering.
 */
class Counter extends Component<{}, CounterState> {
  constructor() {
    super({});
    this.state = { count: 0 };
  }

  onMount(): void {
    console.log('Counter mounted');
  }

  onUpdate(): void {
    console.log(`Counter updated: ${this.state.count}`);
  }

  render(): VNode {
    return h('div', { className: 'counter' },
      h('h1', null, `Count: ${this.state.count}`),
      h('div', { className: 'buttons' },
        h('button', {
          onClick: () => this.setState({ count: this.state.count - 1 }),
        }, '- Decrement'),
        h('button', {
          onClick: () => this.setState({ count: 0 }),
        }, 'Reset'),
        h('button', {
          onClick: () => this.setState({ count: this.state.count + 1 }),
        }, '+ Increment'),
      ),
      h('p', { style: { color: this.state.count < 0 ? 'red' : 'green' } },
        this.state.count >= 0 ? 'Positive' : 'Negative',
      ),
    );
  }
}

// Mount the counter app
const root = document.getElementById('app');
if (root) {
  const app = new App();
  app.mount(root, new Counter());
}
