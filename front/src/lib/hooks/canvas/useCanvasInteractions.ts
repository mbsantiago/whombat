import { type DOMAttributes } from "react";
import { mergeProps } from "react-aria";
import type {
  MoveStartEvent,
  MoveMoveEvent,
  MoveEndEvent,
  PressEvent,
} from "react-aria";

import type { SpectrogramWindow, Position } from "@/lib/types";
import useViewportMove from "../interactions/useViewportMove";
import useViewportPosition from "../interactions/useViewportPosition";
import useViewportPress from "../interactions/useViewportPress";
import useViewportScroll, {
  type ScrollEvent,
} from "../interactions/useViewportScroll";

export default function useCanvasInteractions({
  viewport,
  onHover,
  onMoveStart,
  onMoveEnd,
  onMove,
  onPress,
  onScroll,
}: {
  viewport: SpectrogramWindow;
  onHover?: (position: Position) => void;
  onMoveStart?: (event: { position: Position } & MoveStartEvent) => void;
  onMoveEnd?: (event: { position: Position } & MoveEndEvent) => void;
  onMove?: (
    event: { position: Position; initial: Position } & MoveMoveEvent,
  ) => void;
  onPress?: (event: { position: Position } & PressEvent) => void;
  onScroll?: (event: ScrollEvent) => void;
}): DOMAttributes<HTMLCanvasElement> {}
