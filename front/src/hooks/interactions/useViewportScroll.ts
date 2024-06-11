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
  ySensitivity = 0.01,
  xSensitivity = 0.05,
}: {
  /** The current spectrogram window being displayed in the canvas. */
  viewport: SpectrogramWindow;
  /** The callback function to handle scroll events. */
  onScroll?: (event: ScrollEvent) => void;
  /** The sensitivity of the scroll event in the frequency direction. */
  ySensitivity?: number;
  /** The sensitivity of the scroll event in the time direction. */
  xSensitivity?: number;
}) {
  const props = useMemo(() => {
    const handleScroll = (e: React.WheelEvent) => {
      if (onScroll == null || e.target == null) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const duration = viewport.time.max - viewport.time.min;
      const bandwidth = viewport.freq.max - viewport.freq.min;
      const deltaX = e.shiftKey ? e.deltaY : e.deltaX;
      const deltaY = e.shiftKey ? e.deltaX : e.deltaY;

      onScroll({
        shift: {
          time: ((duration * deltaX) / width) * xSensitivity,
          freq: ((bandwidth * deltaY) / height) * ySensitivity,
        },
        type: "wheel",
        deltaX: e.deltaX,
        deltaY: e.deltaY,
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        altKey: e.altKey,
        preventDefault: e.preventDefault,
        stopPropagation: e.stopPropagation,
      });
    };

    return {
      onWheelCapture: handleScroll,
    };
  }, [onScroll, viewport, ySensitivity, xSensitivity]);

  return { scrollProps: props };
}
