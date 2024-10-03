import { useCallback, useEffect, useRef, useState } from "react";

import useWindowSize from "./useWindowSize";

export default function useElementSize<T extends HTMLElement>({
  onResize,
}: {
  onResize?: (size: { width: number; height: number }) => void;
} = {}): {
  size: { width: number; height: number };
  ref: React.RefObject<T>;
} {
  const ref = useRef<T>(null);

  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const handleResize = useCallback(() => {
    if (ref.current == null) return;
    const { width, height } = ref.current.getBoundingClientRect();
    setSize({ width, height });
    onResize?.({ width, height });
  }, [onResize]);

  useEffect(() => {
    handleResize();
  }, [handleResize]);

  useWindowSize({ onResize: handleResize });

  return {
    size,
    ref,
  };
}
