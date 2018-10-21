import { VNode } from './types';

type EventHandler = (event: SyntheticEvent) => void;
type EventMap = Map<string, Map<Element, EventHandler>>;

interface SyntheticEvent {
  type: string;
  target: Element;
  currentTarget: Element;
  preventDefault(): void;
  stopPropagation(): void;
  nativeEvent: Event;
}

const eventMap: EventMap = new Map();
let rootElement: Element | null = null;

function createSyntheticEvent(nativeEvent: Event, currentTarget: Element): SyntheticEvent {
  let propagationStopped = false;
  return {
    type: nativeEvent.type,
    target: nativeEvent.target as Element,
    currentTarget,
    preventDefault: () => nativeEvent.preventDefault(),
    stopPropagation: () => { propagationStopped = true; nativeEvent.stopPropagation(); },
    nativeEvent,
  };
}

function handleEvent(nativeEvent: Event) {
  const type = nativeEvent.type;
  const handlers = eventMap.get(type);
  if (!handlers) return;

  let target = nativeEvent.target as Element | null;
  while (target && target !== rootElement) {
    const handler = handlers.get(target);
    if (handler) {
      handler(createSyntheticEvent(nativeEvent, target));
    }
    target = target.parentElement;
  }
}

export function setEventRoot(element: Element) {
  rootElement = element;
}

export function addEventListener(element: Element, type: string, handler: EventHandler) {
  if (!eventMap.has(type)) {
    eventMap.set(type, new Map());
    rootElement?.addEventListener(type, handleEvent, true);
  }
  eventMap.get(type)!.set(element, handler);
}

export function removeEventListener(element: Element, type: string) {
  const handlers = eventMap.get(type);
  if (handlers) {
    handlers.delete(element);
    if (handlers.size === 0) {
      eventMap.delete(type);
      rootElement?.removeEventListener(type, handleEvent, true);
    }
  }
}

export function removeAllListeners(element: Element) {
  for (const [type, handlers] of eventMap) {
    handlers.delete(element);
  }
}
