import { useMemo } from "react";
import type { SpectrogramWindow, ScrollEvent } from "@/types";

/**
 * A custom React hook for handling scroll events on an HTML element.
 *
 * This hook provides a `scrollProps` object containing an `onWheel` event
 * handler that can be attached to an elevemnt to capture and process scroll
 * events. The handler calculates the time and frequency deltas based on the
 * scroll direction and the provided `viewport`, and then invokes the
 * `onScroll` callback if provided.
 *
 * @example
 * const { scrollProps } = useViewportScroll({
 *   viewport: { time: { min: 0, max: 10 }, freq: { min: 0, max: 1000 } },
 *   onScroll: (event) => console.log(event), // Log scroll details
 * });
 *
 * return <canvas {...scrollProps} />
 */
export default function useViewportScroll({
  viewport,
  onScroll,
}: {
  viewport: SpectrogramWindow;
  onScroll?: (event: ScrollEvent) => void;
}) {
  const scrollProps = useMemo(
    () => ({
      onWheel: (e: React.WheelEvent) => {
        if (onScroll == null) return;
        e.preventDefault();
        const delta = e.deltaY;
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const duration = viewport.time.max - viewport.time.min;
        const bandwidth = viewport.freq.max - viewport.freq.min;
        onScroll?.({
          shift: {
            time: (duration * delta) / width,
            freq: (bandwidth * delta) / height,
          },
          type: "wheel",
          shiftKey: e.shiftKey,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          altKey: e.altKey,
        });
      },
    }),
    [viewport, onScroll],
  );

  return { scrollProps };
}
