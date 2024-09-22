import { useMemo, useRef } from "react";

import type { HoverHandler, SpectrogramWindow } from "@/lib/types";

/**
 * A custom React hook for managing cursor position and interaction on a HTML
 * element.
 *
 * This hook calculates and tracks the cursor position within the bounds of the
 * element, taking into account the provided `viewport` (which defines the time
 * and frequency ranges) and an optional `onMove` callback.
 *
 * @example
 * const { positionProps, cursorPosition } = useViewportPosition({
 *   viewport: { time: { min: 0, max: 10 }, freq: { min: 0, max: 1000 } },
 *   onMove: ({ position }) => console.log(position),
 * });
 *
 * return <canvas {...positionProps} />
 */
export default function useViewportPosition({
  viewport,
  onMove,
}: {
  viewport: SpectrogramWindow;
  onMove?: HoverHandler;
}) {
  const cursorPosition = useRef<{ time: number; freq: number }>({
    time: 0,
    freq: 0,
  });

  const positionProps = useMemo(() => {
    return {
      onPointerMove: (e: React.PointerEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        cursorPosition.current = {
          time:
            (x / rect.width) * (viewport.time.max - viewport.time.min) +
            viewport.time.min,
          freq:
            (1 - y / rect.height) * (viewport.freq.max - viewport.freq.min) +
            viewport.freq.min,
        };
        onMove?.({ position: cursorPosition.current });
      },
    };
  }, [viewport, onMove]);

  return {
    positionProps,
    cursorPosition,
  };
}
