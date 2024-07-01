import { useRef, useCallback } from "react";
import { mergeProps } from "react-aria";

import type {
  SpectrogramWindow,
  HoverHandler,
  MoveStartHandler,
  MoveEndHandler,
  MoveHandler,
  PressHandler,
  ScrollHandler,
  DoublePressHandler,
  DrawFn,
} from "@/types";
import useCaptureScroll from "@/hooks/utils/useCaptureScroll";
import useCanvasDraw from "@/hooks/draw/useCanvas";
import useViewportMove from "@/hooks/interactions/useViewportMove";
import useViewportPosition from "@/hooks/interactions/useViewportPosition";
import useViewportPress from "@/hooks/interactions/useViewportPress";
import useViewportScroll from "@/hooks/interactions/useViewportScroll";
import useViewportDoublePress from "@/hooks/interactions/useViewportDoublePress";

/**
 * A comprehensive custom React hook for managing various interactions and
 * rendering on a canvas element.
 *
 * This hook consolidates functionality from multiple other hooks
 * (`useCanvasPosition`, `useCanvasMove`, `useCanvasPress`, `useCanvasScroll`)
 * to provide a unified interface for interacting with and drawing on a canvas.
 *
 * It handles cursor position tracking, move (drag) events, press (click/tap)
 * events, scroll events, and the rendering of custom content onto the canvas
 * using the provided `drawFn`.
 *
 * @example
 * const { ref, props } = useCanvas({
 *   drawFn: (ctx, viewport) => {
 *     // Draw your custom content on the canvas here
 *   },
 *   viewport: { time: { min: 0, max: 10 }, freq: { min: 0, max: 1000 } },
 *   // ... other callbacks as needed
 * });
 *
 * return <canvas ref={ref} {...props} />
 */
export default function useCanvas({
  drawFn,
  viewport,
  onHover,
  onMoveStart,
  onMoveEnd,
  onMove,
  onPress,
  onScroll,
  onDoubleClick,
}: {
  drawFn: DrawFn;
  viewport: SpectrogramWindow;
  onHover?: HoverHandler;
  onMoveStart?: MoveStartHandler;
  onMoveEnd?: MoveEndHandler;
  onMove?: MoveHandler;
  onPress?: PressHandler;
  onScroll?: ScrollHandler;
  onDoubleClick?: DoublePressHandler;
}): {
  ref: React.RefObject<HTMLCanvasElement>;
  props: React.DOMAttributes<HTMLCanvasElement>;
} {
  const ref = useRef<HTMLCanvasElement>(null);

  const { positionProps, cursorPosition } = useViewportPosition({
    viewport,
    onMove: onHover,
  });

  const { moveProps } = useViewportMove({
    viewport,
    cursorPosition,
    onMoveStart,
    onMoveEnd,
    onMove,
  });

  const { pressProps } = useViewportPress({
    onPress,
    cursorPosition,
  });

  const { doublePressProps } = useViewportDoublePress({
    onDoublePress: onDoubleClick,
    cursorPosition,
  });

  const { scrollProps } = useViewportScroll({
    cursorPosition,
    viewport,
    onScroll,
  });

  const props = mergeProps(
    moveProps,
    pressProps,
    scrollProps,
    doublePressProps,
    positionProps,
  );

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      drawFn(ctx, viewport);
    },
    [drawFn, viewport],
  );

  useCaptureScroll({ ref });

  useCanvasDraw({ ref, draw });

  return {
    ref,
    props,
  };
}
