type Task = () => void;

interface Scheduler {
  scheduleUpdate(task: Task): void;
  flush(): void;
  clear(): void;
}

const pendingTasks: Task[] = [];
let frameId: number | null = null;
let isFlushing = false;

function processTasks() {
  isFlushing = true;
  const tasks = pendingTasks.splice(0);
  for (const task of tasks) {
    try {
      task();
    } catch (err) {
      console.error('Scheduler task error:', err);
    }
  }
  isFlushing = false;
  frameId = null;
}

export function scheduleUpdate(task: Task) {
  pendingTasks.push(task);
  if (frameId === null) {
    frameId = typeof requestAnimationFrame !== 'undefined'
      ? requestAnimationFrame(processTasks)
      : (setTimeout(processTasks, 0) as unknown as number);
  }
}

export function flush() {
  if (frameId !== null) {
    if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(frameId);
    else clearTimeout(frameId);
    frameId = null;
  }
  processTasks();
}

export function clear() {
  pendingTasks.length = 0;
  if (frameId !== null) {
    if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(frameId);
    else clearTimeout(frameId);
    frameId = null;
  }
}

export function hasPendingUpdates(): boolean {
  return pendingTasks.length > 0 || isFlushing;
}

export function batchUpdates(fn: () => void) {
  const prevFlushing = isFlushing;
  isFlushing = true;
  try {
    fn();
  } finally {
    isFlushing = prevFlushing;
    if (!isFlushing && pendingTasks.length > 0) {
      flush();
    }
  }
}

export const scheduler: Scheduler = { scheduleUpdate, flush, clear };
