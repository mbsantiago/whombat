import { useMemo } from "react";
import { mergeProps } from "react-aria";

import type {
  MoveStartEvent,
  MoveMoveEvent,
  MoveEndEvent,
  PressEvent,
} from "react-aria";

import { getViewportPosition } from "@/utils/windows";
import useElementSize from "@/hooks/utils/useElementSize";
import useViewportMove from "@/hooks/interactions/useViewportMove";
import useViewportPosition from "@/hooks/interactions/useViewportPosition";
import useViewportPress from "@/hooks/interactions/useViewportPress";
import useViewportScroll from "@/hooks/interactions/useViewportScroll";

import type { SpectrogramWindow, Position, ScrollEvent } from "@/types";

export default function useSpectrogramBar({
  viewport,
  bounds,
  onPress,
  onScroll,
  onMoveStart,
  onMoveEnd,
  onMove,
}: {
  bounds: SpectrogramWindow;
  viewport: SpectrogramWindow;
  onMoveStart?: (event: { position: Position } & MoveStartEvent) => void;
  onMoveEnd?: (event: { position: Position } & MoveEndEvent) => void;
  onMove?: (
    event: {
      position: Position;
      initial: Position;
      shift: Position;
    } & MoveMoveEvent,
  ) => void;
  onPress?: (event: { position: Position } & PressEvent) => void;
  onScroll?: (event: ScrollEvent) => void;
}): {
  position: React.CSSProperties;
  props: React.DOMAttributes<HTMLDivElement>;
  ref: React.RefObject<HTMLDivElement>;
} {
  const { ref, size } = useElementSize<HTMLDivElement>();

  const { positionProps, cursorPosition } = useViewportPosition({
    viewport,
  });

  const { pressProps: barPressProps } = useViewportPress({
    onPress,
    cursorPosition,
  });

  const { scrollProps } = useViewportScroll({
    viewport: bounds,
    onScroll,
  });

  const { moveProps: thumbProps } = useViewportMove({
    viewport: bounds,
    cursorPosition,
    onMoveStart,
    onMoveEnd,
    onMove,
  });

  const position = useMemo(() => {
    return getViewportPosition({
      width: size.width,
      height: size.height,
      viewport,
      bounds,
    });
  }, [viewport, bounds, size]);

  const props = mergeProps(
    barPressProps,
    positionProps,
    scrollProps,
    thumbProps,
  );

  return {
    position,
    props,
    ref,
  };
}
