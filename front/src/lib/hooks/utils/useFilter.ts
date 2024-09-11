import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "react-use";

/**
 * Represents a generic filter state object with various utility functions.
 */
export type Filter<T extends Object> = {
  /** The current filter state. */
  filter: T;
  /**
   * Sets the value for a specific key in the filter state.
   * @param key - The key to set.
   * @param value - The value to set for the key.
   * @param force - If true, sets the value even if the key is fixed.
   */
  set: <K extends keyof T>(key: K, value: T[K], force?: boolean) => void;
  /**
   * Updates the filter state with a partial object.
   * @param value - The partial object to update the filter state with.
   * */
  update: (value: Partial<T>) => void;
  /**
   * Gets the value for a specific key in the filter state.
   * @param key - The key to get.
   * @returns The value for the specified key.
   */
  get: <K extends keyof T>(key: K) => T[K];
  /**
   * Clears the value for a specific key in the filter state.
   * @param key - The key to clear.
   * @param force - If true, clears the value even if the key is fixed.
   */
  clear: <K extends keyof T>(key: K, force?: boolean) => void;
  /** Resets the filter state to its default and fixed values. */
  reset: () => void;
  /** Submits the current filter state.
   * This is particularly useful when the filter state is debounced.
   */
  submit: () => void;
  /**
   * Checks if a specific key in the filter state is fixed.
   * @param key - The key to check.
   * @returns True if the key is fixed, false otherwise.
   */
  isFixed: <K extends keyof T>(key: K) => boolean;
  fixed: (keyof T)[];
  /** The count of non-fixed keys in the filter state. */
  size: number;
};

const _fixed: any[] = [];

/**
 * A React hook for managing a debounced filter state object.
 * The filter state is debounced by default.
 *
 * @param defaults - The default filter state.
 * @param fixed - An array of keys that cannot be changed.
 * @param debounce - The debounce time in milliseconds.
 * @returns An object with the filter state, a set function, a get function,
 * and utility functions for managing the state.
 */
export default function useFilter<T extends Object>({
  defaults,
  fixed = _fixed,
  debounce = 500,
}: {
  defaults: T;
  fixed?: (keyof T)[];
  debounce?: number;
  prefix?: string;
}): Filter<T> {
  const [state, setState] = useState<T>(defaults);
  const [debouncedState, setDebouncedState] = useState<T>(state);

  // Reset the state when the fixed filter changes
  useEffect(() => {
    setState(defaults);
    setDebouncedState(defaults);
  }, [defaults]);

  const isFixed = useCallback((key: keyof T) => fixed.includes(key), [fixed]);

  const set = useCallback(
    <K extends keyof T>(
      key: K,
      value: (typeof state)[K],
      force: boolean = false,
    ) => {
      if (isFixed(key) && !force) return;
      setState((prev) => ({ ...prev, [key]: value }));
    },
    [isFixed],
  );
  const get = useCallback(
    <K extends keyof T>(key: K): (typeof state)[K] => state[key],
    [state],
  );
  const clear = useCallback(
    <K extends keyof T>(key: K, force: boolean = false) => {
      if (isFixed(key) && !force) return;
      setState((prev) => {
        // Delete the key from a copy of the state
        const newState = { ...prev };
        delete newState[key];

        // Do not debounce when clearing
        setDebouncedState(newState);

        return newState;
      });
    },
    [isFixed],
  );

  const reset = useCallback(() => setState(defaults), [defaults]);

  const update = useCallback((value: Partial<T>) => {
    setState((prev) => ({ ...prev, ...value }));
  }, []);

  useDebounce(
    () => {
      setDebouncedState(state);
    },
    debounce,
    [state],
  );

  const submit = useCallback(() => {
    setDebouncedState(state);
  }, [state]);

  const size = useMemo(() => {
    // @ts-ignore
    return Object.keys(state).filter((key) => !isFixed(key)).length;
  }, [state, isFixed]);

  return {
    filter: debouncedState,
    update,
    set,
    get,
    clear,
    reset,
    submit,
    size,
    isFixed,
    fixed,
  };
}
