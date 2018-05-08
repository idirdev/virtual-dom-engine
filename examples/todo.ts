import { Component, h, App, VNode } from '../src';

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoState {
  items: TodoItem[];
  inputValue: string;
  nextId: number;
  filter: 'all' | 'active' | 'completed';
}

/**
 * A full todo list app demonstrating keyed lists, event handling,
 * and more advanced state management with the virtual DOM engine.
 */
class TodoApp extends Component<{}, TodoState> {
  constructor() {
    super({});
    this.state = {
      items: [],
      inputValue: '',
      nextId: 1,
      filter: 'all',
    };
  }

  private addTodo(): void {
    const text = this.state.inputValue.trim();
    if (!text) return;

    this.setState({
      items: [
        ...this.state.items,
        { id: this.state.nextId, text, completed: false },
      ],
      inputValue: '',
      nextId: this.state.nextId + 1,
    });
  }

  private toggleTodo(id: number): void {
    this.setState({
      items: this.state.items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    });
  }

  private removeTodo(id: number): void {
    this.setState({
      items: this.state.items.filter((item) => item.id !== id),
    });
  }

  private getFilteredItems(): TodoItem[] {
    switch (this.state.filter) {
      case 'active':
        return this.state.items.filter((i) => !i.completed);
      case 'completed':
        return this.state.items.filter((i) => i.completed);
      default:
        return this.state.items;
    }
  }

  render(): VNode {
    const filtered = this.getFilteredItems();
    const remaining = this.state.items.filter((i) => !i.completed).length;

    return h('div', { className: 'todo-app' },
      h('h1', null, 'Todo List'),

      // Input form
      h('div', { className: 'todo-input' },
        h('input', {
          type: 'text',
          placeholder: 'What needs to be done?',
          value: this.state.inputValue,
          onInput: (e: Event) => {
            this.setState({ inputValue: (e.target as HTMLInputElement).value });
          },
          onKeyDown: (e: Event) => {
            if ((e as KeyboardEvent).key === 'Enter') this.addTodo();
          },
        }),
        h('button', { onClick: () => this.addTodo() }, 'Add'),
      ),

      // Filter buttons
      h('div', { className: 'filters' },
        ...(['all', 'active', 'completed'] as const).map((f) =>
          h('button', {
            key: f,
            className: this.state.filter === f ? 'active' : '',
            onClick: () => this.setState({ filter: f }),
          }, f.charAt(0).toUpperCase() + f.slice(1)),
        ),
      ),

      // Todo items (keyed list for efficient updates)
      h('ul', { className: 'todo-list' },
        ...filtered.map((item) =>
          h('li', {
            key: item.id,
            className: item.completed ? 'completed' : '',
            style: { textDecoration: item.completed ? 'line-through' : 'none' },
          },
            h('input', {
              type: 'checkbox',
              checked: item.completed,
              onClick: () => this.toggleTodo(item.id),
            }),
            h('span', null, item.text),
            h('button', {
              className: 'remove',
              onClick: () => this.removeTodo(item.id),
            }, 'X'),
          ),
        ),
      ),

      // Status bar
      h('div', { className: 'status' },
        h('span', null, `${remaining} item${remaining !== 1 ? 's' : ''} remaining`),
        this.state.items.some((i) => i.completed)
          ? h('button', {
              onClick: () => this.setState({
                items: this.state.items.filter((i) => !i.completed),
              }),
            }, 'Clear completed')
          : h('span', null, ''),
      ),
    );
  }
}

// Mount the todo app
const root = document.getElementById('app');
if (root) {
  const app = new App();
  app.mount(root, new TodoApp());
}
