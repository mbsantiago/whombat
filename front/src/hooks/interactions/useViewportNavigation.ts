import type {
  MoveStartEvent,
  MoveMoveEvent,
  PressEvent,
  MoveEndEvent,
} from "react-aria";
import { useCallback } from "react";
import type { ViewportControler } from "@/hooks/window/useWindow";
import type { Position, ScrollEvent } from "@/types";

export default function useViewportNavigation({
  centerOn,
  expand,
  shift,
  save,
}: Pick<ViewportControler, "centerOn" | "expand" | "shift" | "save">) {
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
    [expand, shift],
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
