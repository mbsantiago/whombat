import { useCallback } from "react";

import type {
  CanvasHandlers,
  MoveHandler,
  MoveStartHandler,
  Position,
  ScrollEvent,
  ViewportController,
} from "@/lib/types";

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
