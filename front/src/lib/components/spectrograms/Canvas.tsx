import type { DOMAttributes } from "react";
import type {
  SpectrogramWindow,
  DrawFn,
  HoverHandler,
  MoveStartHandler,
  MoveEndHandler,
  MoveHandler,
  PressHandler,
  ScrollHandler,
  DoublePressHandler,
} from "@/lib/types";
import useCanvas from "@/lib/hooks/canvas/useCanvas";

export type CanvasProps = {
  /** A callback that is called when the cursor hovers over the canvas. */
  onHover?: HoverHandler;
  /** A callback that is called when the user starts moving the cursor on the
   * canvas. */
  onMoveStart?: MoveStartHandler;
  /** A callback that is called when the user stops moving the cursor on the
   * canvas. */
  onMoveEnd?: MoveEndHandler;
  /** A callback that is called when the user moves the cursor on the canvas.
   * */
  onMove?: MoveHandler;
  /** A callback that is called when the user presses the canvas. */
  onPress?: PressHandler;
  /** A callback that is called when the user scrolls the canvas. */
  onScroll?: ScrollHandler;
  /** A callback that is called when the user double clicks the canvas. */
  onDoubleClick?: DoublePressHandler;
} & Omit<
  DOMAttributes<HTMLCanvasElement>,
  | "onHover"
  | "onMoveStart"
  | "onMoveEnd"
  | "onMove"
  | "onPress"
  | "onScroll"
  | "onDoubleClick"
>;

/**
 * A React component for creating an interactive canvas element.
 *
 * This component encapsulates the `useCanvas` hook, providing a convenient way
 * to render and manage various interactions (hover, move, press, scroll) on a
 * canvas. It's designed for flexibility, allowing you to define custom drawing
 * logic (`drawFn`) and handle a wide range of events.
 */
export default function Canvas({
  viewport,
  height = 400,
  drawFn,
  onHover,
  onMoveStart,
  onMoveEnd,
  onMove,
  onPress,
  onScroll,
  onDoubleClick,
  canvasRef,
  ...rest
}: {
  /** The function to use for drawing on the canvas. */
  drawFn?: DrawFn;
  /** The current viewport of the spectrogram. */
  viewport: SpectrogramWindow;
  /** The height of the canvas. */
  height: number | string;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
} & CanvasProps) {
  const { ref, props } = useCanvas({
    drawFn,
    viewport,
    onHover,
    onMoveStart,
    onMoveEnd,
    onMove,
    onPress,
    onScroll,
    onDoubleClick,
    canvasRef,
  });
  return (
    <div className="overflow-hidden rounded-md" style={{ height }}>
      <canvas ref={ref} className="w-full h-full" {...props} {...rest} />
    </div>
  );
}
