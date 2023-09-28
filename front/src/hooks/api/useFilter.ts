import { useState, useEffect, useMemo, useCallback } from "react";
import { useDebounce } from "react-use";

export type Filter<T extends Object> = {
  filter: T;
  set: <K extends keyof T>(key: K, value: T[K], force?: boolean) => void;
  get: <K extends keyof T>(key: K) => T[K];
  clear: <K extends keyof T>(key: K, force?: boolean) => void;
  reset: () => void;
  submit: () => void;
  isFixed: <K extends keyof T>(key: K) => boolean;
  size: number;
};

/**
 * A hook for managing a filter state object.
 * The filter state is debounced by default.
 * @param initialState The initial state of the filter.
 * @param debounce The debounce time in milliseconds.
 * @returns An object with the filter state, a set function, a get function,
 * and a submit function.
 */
export default function useFilter<T extends Object>({
  fixed,
  debounce = 500,
}: {
  fixed: T;
  debounce?: number;
  prefix?: string;
}): Filter<T> {
  const [state, setState] = useState<T>(fixed);
  const [debouncedState, setDebouncedState] = useState<T>(fixed);

  // Reset the state when the fixed filter changes
  useEffect(() => {
    setState(fixed);
    setDebouncedState(fixed);
  }, [fixed]);

  const isFixed = useCallback(
    (key: keyof T) => fixed[key] !== undefined,
    [fixed],
  );

  const set = <K extends keyof T>(
    key: K,
    value: (typeof state)[K],
    force: boolean = false,
  ) => {
    if (isFixed(key) && !force) return;
    setState((prev) => ({ ...prev, [key]: value }));
  };
  const get = <K extends keyof T>(key: K): (typeof state)[K] => state[key];
  const clear = <K extends keyof T>(key: K, force: boolean = false) => {
    if (isFixed(key) && !force) return;
    setState((prev) => {
      // Delete the key from a copy of the state
      const newState = { ...prev };
      delete newState[key];

      // Do not debounce when clearing
      setDebouncedState(newState);

      return newState;
    });
  };
  const reset = () => setState(fixed);

  useDebounce(
    () => {
      setDebouncedState(state);
    },
    debounce,
    [state],
  );

  const submit = () => {
    setDebouncedState(state);
  };

  const size = useMemo(() => {
    // @ts-ignore
    return Object.keys(state).filter((key) => !isFixed(key)).length;
  }, [state, isFixed]);

  return {
    filter: debouncedState,
    set,
    get,
    clear,
    reset,
    submit,
    size,
    isFixed,
  };
}
