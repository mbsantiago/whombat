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
    ({ shift: { time, freq }, ctrlKey }: ScrollEvent) => {
      if (ctrlKey) {
        expand({ time, freq });
      } else {
        shift({ time, freq: -freq });
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
