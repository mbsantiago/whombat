import { useState } from "react";
import { useDebounce } from "react-use";

/**
 * A hook for managing a filter state object.
 * The filter state is debounced by default.
 * @param initialState The initial state of the filter.
 * @param debounce The debounce time in milliseconds.
 * @returns An object with the filter state, a set function, a get function,
 * and a submit function.
 */
export default function useFilter<T extends Object>({
  initialState,
  debounce = 500,
}: {
  initialState: T;
  debounce?: number;
}) {
  const [state, setState] = useState(initialState);
  const [debouncedState, setDebouncedState] = useState(initialState);

  const set = <K extends keyof T>(key: K, value: (typeof state)[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));
  const get = <K extends keyof T>(key: K): (typeof state)[K] => state[key];

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

  return {
    filter: debouncedState,
    set,
    get,
    submit,
  } as const;
}
