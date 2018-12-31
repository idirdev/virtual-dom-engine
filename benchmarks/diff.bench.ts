import { createElement } from '../src/createElement';
import { diff } from '../src/diff';

function buildTree(depth: number, breadth: number): any {
  if (depth === 0) return createElement('span', {}, ['leaf']);
  const children = Array.from({ length: breadth }, () => buildTree(depth - 1, breadth));
  return createElement('div', { className: 'l' + depth }, children);
}

function bench(name: string, fn: () => void, n = 1000) {
  const start = performance.now();
  for (let i = 0; i < n; i++) fn();
  const ms = ((performance.now() - start) / n).toFixed(3);
  console.log(name + ': ' + ms + 'ms avg (' + n + ' runs)');
}

const a = buildTree(3, 3);
const b = buildTree(3, 3);
bench('diff small (3x3)', () => diff(a, b));

const ma = buildTree(4, 4);
const mb = buildTree(4, 4);
bench('diff medium (4x4)', () => diff(ma, mb));
