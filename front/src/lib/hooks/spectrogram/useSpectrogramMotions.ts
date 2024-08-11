import { useCallback, useState } from "react";
import { mergeProps } from "react-aria";

// import useSpectrogramDrag from "@/lib/hooks/spectrogram/useSpectrogramDrag";
import useSpectrogramZoom from "@/lib/hooks/spectrogram/useSpectrogramZoom";
import useWindowScroll from "@/lib/hooks/window/useWindowScroll";

import type {
  Position,
  SpectrogramWindow,
  CanvasHandlers,
  ScrollEvent,
  MoveHandler,
  MoveStartHandler,
} from "@/lib/types";
import type { ViewportController } from "@/lib/hooks/window/useViewport";

/**
 * The motion modes supported by the spectrogram motions.
 *
 * @description Either "drag", "zoom", or "idle".
 */
export type MotionMode = "drag" | "zoom" | "idle";

/**
 * The state of the spectrogram motions.
 */
export type MotionState = {
  canDrag: boolean;
  canZoom: boolean;
  enabled: boolean;
};

/**
 * The controls for managing spectrogram motions.
 */
export type MotionControls = {
  enableDrag: () => void;
  enableZoom: () => void;
  disable: () => void;
};

export function useSpectrogramDrag({
  viewport,
}: {
  viewport: ViewportController;
}): {
  onMove: MoveHandler;
  onMoveStart: MoveStartHandler;
} {
  const { shift, save } = viewport;
  const onMove = useCallback(
    ({ shift: { time, freq } }: { shift: Position }) => {
      shift({ time: -time, freq });
    },
    [shift],
  );
  const onMoveStart = useCallback(() => {
    save();
  }, [save]);
  return {
    onMove,
    onMoveStart,
  };
}

export function useSpectrogramScroll({
  viewport,
}: {
  viewport: ViewportController;
}): CanvasHandlers {
  const { expand, shift, zoomToPosition } = viewport;

  const onScroll = useCallback(
    ({
      position,
      ctrlKey,
      shiftKey,
      altKey,
      timeFrac,
      freqFrac,
      deltaX,
      deltaY,
    }: ScrollEvent) => {
      if (altKey) {
        zoomToPosition({
          position,
          factor: 1 + 4 * timeFrac * (shiftKey ? deltaX : deltaY),
        });
      } else if (ctrlKey) {
        expand({
          time: timeFrac * (shiftKey ? deltaX : deltaY),
          freq: freqFrac * (shiftKey ? deltaY : deltaX),
        });
      } else {
        shift({
          time: timeFrac * (shiftKey ? deltaY : deltaX),
          freq: -freqFrac * (shiftKey ? deltaX : deltaY),
        });
      }
    },
    [expand, shift, zoomToPosition],
  );

  return {
    onScroll,
  };
}
