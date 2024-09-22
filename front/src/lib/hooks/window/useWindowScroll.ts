import { type WheelEvent, useMemo } from "react";

import type { SpectrogramWindow } from "@/lib/types";
import { scaleXToWindow, scaleYToWindow } from "@/lib/utils/geometry";

/**
 * The `useWindowScroll` hook provides functionality to handle window scrolling
 * events, such as mouse wheel scrolls, and calculates the corresponding
 * adjustments to the spectrogram window based on user input.
 */
export default function useWindowScroll({
  viewport,
  dimensions,
  onScroll,
  shift = false,
  ctrl = false,
  alt = false,
  enabled = true,
  relative = false,
}: {
  /** The current spectrogram window being displayed in the canvas. */
  viewport: SpectrogramWindow;
  /** The dimensions of the spectrogram canvas. */
  dimensions: { width: number; height: number };
  /** The callback function to handle scroll events. */
  onScroll?: ({
    time,
    freq,
    timeRatio,
    freqRatio,
  }: {
    time?: number;
    freq?: number;
    timeRatio?: number;
    freqRatio?: number;
  }) => void;
  /** Indicates whether the Shift key should be pressed. */
  shift?: boolean;
  /** Indicates whether the Ctrl key should be pressed. */
  ctrl?: boolean;
  /** Indicates whether the Alt key should be pressed. */
  alt?: boolean;
  /** If disabled, the hook will not respond to scroll events. */
  enabled?: boolean;
  /** If true, the scroll event will be interpreted as a relative scroll. */
  relative?: boolean;
}) {
  const scrollProps = useMemo(() => {
    return {
      onWheel: (event: WheelEvent) => {
        const { deltaY, shiftKey, ctrlKey, altKey, metaKey } = event;
        const specialKey = metaKey || altKey;
        if (
          !enabled ||
          ctrlKey != ctrl ||
          shiftKey != shift ||
          specialKey != alt
        )
          return;

        switch (true) {
          case shiftKey && relative:
            return onScroll?.({ timeRatio: deltaY / dimensions.width });

          case !shiftKey && relative:
            return onScroll?.({ freqRatio: deltaY / dimensions.height });

          case shiftKey && !relative:
            const deltaTime = scaleXToWindow(
              deltaY,
              viewport,
              dimensions.width,
              true,
            );
            return onScroll?.({ time: deltaTime });

          case !shiftKey && !relative:
            const deltaFreq = scaleYToWindow(
              deltaY,
              viewport,
              dimensions.height,
              true,
            );
            return onScroll?.({ freq: -deltaFreq });
        }
      },
    };
  }, [enabled, onScroll, dimensions, ctrl, shift, alt, relative, viewport]);

  return {
    scrollProps,
  };
}
