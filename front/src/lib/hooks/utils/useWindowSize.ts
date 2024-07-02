import { useLayoutEffect, useState } from "react";

export default function useWindowSize({
  onResize,
}: {
  onResize?: (size: [number, number]) => void;
}) {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
      onResize?.([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, [onResize]);
  return size;
}
