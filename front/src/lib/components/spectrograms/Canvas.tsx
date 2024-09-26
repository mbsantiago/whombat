import useCanvas from "@/lib/hooks/canvas/useCanvas";

import type { CanvasProps, DrawFn, SpectrogramWindow } from "@/lib/types";

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
