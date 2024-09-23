import { useCallback } from "react";
import type {
  MoveEndEvent,
  MoveMoveEvent,
  MoveStartEvent,
  PressEvent,
} from "react-aria";

import type { Position, ScrollEvent, ViewportController } from "@/lib/types";

export default function useSpectrogramBarInteractions({
  viewport,
  timeSensitivity = 0.1,
  freqSensitivity = 0.01,
}: {
  viewport: ViewportController;
  timeSensitivity?: number;
  freqSensitivity?: number;
}) {
  const { centerOn, expand, shift, save } = viewport;

  const onScroll = useCallback(
    ({
      deltaX,
      deltaY,
      timeFrac,
      freqFrac,
      ctrlKey,
      shiftKey,
    }: ScrollEvent) => {
      if (ctrlKey) {
        expand({
          time: timeSensitivity * timeFrac * (shiftKey ? deltaX : deltaY),
          freq: freqSensitivity * freqFrac * (shiftKey ? deltaY : deltaX),
        });
      } else {
        shift({
          time: timeSensitivity * timeFrac * (shiftKey ? deltaY : deltaX),
          freq: -freqSensitivity * freqFrac * (shiftKey ? deltaX : deltaY),
        });
      }
    },
    [expand, shift, timeSensitivity, freqSensitivity],
  );

  const onPress = useCallback(
    ({ position }: { position: Position } & PressEvent) => {
      centerOn(position);
    },
    [centerOn],
  );

  const onMoveStart = useCallback(
    ({}: { position: Position } & MoveStartEvent) => save(),
    [save],
  );

  const onMoveEnd = useCallback(
    ({}: { position: Position } & MoveEndEvent) => save(),
    [save],
  );

  const onMove = useCallback(
    ({ position }: { position: Position } & MoveMoveEvent) =>
      centerOn(position),
    [centerOn],
  );

  return {
    onScroll,
    onPress,
    onMoveStart,
    onMove,
    onMoveEnd,
  };
}
