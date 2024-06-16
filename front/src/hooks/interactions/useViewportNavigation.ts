import type {
  MoveStartEvent,
  MoveMoveEvent,
  PressEvent,
  MoveEndEvent,
} from "react-aria";
import { useCallback } from "react";
import type { ViewportController } from "@/hooks/window/useWindow";
import type { Position, ScrollEvent } from "@/types";

export default function useViewportNavigation({
  centerOn,
  expand,
  shift,
  save,
  timeSensitivity = 0.1,
  freqSensitivity = 0.01,
}: {
  timeSensitivity?: number;
  freqSensitivity?: number;
} & Pick<ViewportController, "centerOn" | "expand" | "shift" | "save">) {
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
