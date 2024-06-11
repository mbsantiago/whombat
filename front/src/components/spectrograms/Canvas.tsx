import type {
  MoveStartEvent,
  MoveMoveEvent,
  MoveEndEvent,
  PressEvent,
} from "react-aria";

import type { SpectrogramWindow, Position, ScrollEvent } from "@/types";
import useCanvas from "@/hooks/canvas/useCanvas";

/**
 * A React component for creating an interactive canvas element.
 *
 * This component encapsulates the `useCanvas` hook, providing a convenient way
 * to render and manage various interactions (hover, move, press, scroll) on a
 * canvas. It's designed for flexibility, allowing you to define custom drawing
 * logic (`drawFn`) and handle a wide range of events.
 */
export default function Canvas({
  drawFn,
  viewport,
  height = 400,
  onHover,
  onMoveStart,
  onMoveEnd,
  onMove,
  onPress,
  onScroll,
}: {
  /** The function to use for drawing on the canvas. */
  drawFn: (ctx: CanvasRenderingContext2D, viewport: SpectrogramWindow) => void;
  /** The current viewport of the spectrogram. */
  viewport: SpectrogramWindow;
  /** The height of the canvas. */
  height: number;
  /** A callback that is called when the cursor hovers over the canvas. */
  onHover?: (position: Position) => void;
  /** A callback that is called when the user starts moving the cursor on the canvas. */
  onMoveStart?: (event: { position: Position } & MoveStartEvent) => void;
  /** A callback that is called when the user stops moving the cursor on the canvas. */
  onMoveEnd?: (event: { position: Position } & MoveEndEvent) => void;
  /** A callback that is called when the user moves the cursor on the canvas. */
  onMove?: (
    event: { position: Position; initial: Position } & MoveMoveEvent,
  ) => void;
  /** A callback that is called when the user presses the canvas. */
  onPress?: (event: { position: Position } & PressEvent) => void;
  /** A callback that is called when the user scrolls the canvas. */
  onScroll?: (event: ScrollEvent) => void;
}) {
  const { ref, props } = useCanvas({
    drawFn,
    viewport,
    onHover,
    onMoveStart,
    onMoveEnd,
    onMove,
    onPress,
    onScroll,
  });
  return (
    <div className="overflow-hidden rounded-md" style={{ height }}>
      <canvas ref={ref} className="w-full h-full" {...props} />
    </div>
  );
}
