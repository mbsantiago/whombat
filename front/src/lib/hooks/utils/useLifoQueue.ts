import { SetStateAction, useCallback, useRef, useState } from "react";

export interface QueueMethods<T> {
  push(item: T): void;
  pop(): T | null;
  replace(action: SetStateAction<T>): void;
  clear(): void;
  current: T | null;
  size: number;
}

function isCallback<T>(action: SetStateAction<T>): action is (prev: T) => T {
  return typeof action === "function";
}

export default function useLifoQueue<T>(
  initialValue: T | null,
  maxSize: number | null = 1000,
): QueueMethods<T> {
  const [{ current, size }, setState] = useState<{
    current: T | null;
    size: number;
  }>({ current: initialValue, size: initialValue ? 1 : 0 });
  const queue = useRef<T[]>(initialValue ? [initialValue] : []);

  const push = useCallback(
    (item: T) => {
      if (maxSize != null && queue.current.length >= maxSize) {
        queue.current.shift();
      }
      queue.current.push(item);
      setState({ current: item, size: queue.current.length });
    },
    [maxSize],
  );

  const replace = useCallback((item: SetStateAction<T>) => {
    if (isCallback(item)) {
      let newItem: T = item(queue.current[queue.current.length - 1]);
      queue.current[queue.current.length - 1] = newItem;
      setState({ current: newItem, size: queue.current.length });
    } else {
      queue.current[queue.current.length - 1] = item;
      setState({ current: item, size: queue.current.length });
    }
  }, []);

  const pop = useCallback(() => {
    const item: T | undefined = queue.current.pop();
    setState({
      current:
        queue.current.length === 0
          ? null
          : queue.current[queue.current.length - 1],
      size: queue.current.length,
    });
    return item ?? null;
  }, []);

  const clear = useCallback(() => {
    queue.current = [];
    setState({ current: null, size: 0 });
  }, []);

  return {
    push,
    pop,
    clear,
    replace,
    current,
    size,
  };
}
