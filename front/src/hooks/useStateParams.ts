import { useCallback, useEffect, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";

export default function useStateParams<T>(
  initialState: T,
  paramsName: string,
  serialize: (state: T) => string,
  deserialize: (state: string) => T,
): [T, (state: T) => void] {
  const path = usePathname();
  const searchParams = useSearchParams();
  const existingValue = searchParams.get(paramsName);
  const [state, setStateRaw] = useState<T>(
    existingValue ? deserialize(existingValue) : initialState,
  );

  const setState = useCallback(
    (s: T) => {
      const params = new URLSearchParams(searchParams);
      if (s == null) {
        params.delete(paramsName);
      } else {
        params.set(paramsName, serialize(s));
      }
      const url = new URL(path, window.location.origin);
      url.search = params.toString();
      window.history.replaceState({ [paramsName]: s }, "", url);
      setStateRaw(s);
    },
    [paramsName, searchParams, path, serialize],
  );

  useEffect(() => {
    if (existingValue) {
      setStateRaw(deserialize(existingValue));
    }
  }, [existingValue, setStateRaw, deserialize]);

  useEffect(() => {
    if (initialState != null) {
      setState(initialState);
    }
  }, [initialState, setState]);

  return [state, setState];
}
