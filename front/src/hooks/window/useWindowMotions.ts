import { type MouseEvent, useCallback, useMemo, useState } from "react";
import { mergeProps } from "react-aria";

import { scalePixelsToWindow } from "@/utils/geometry";

import useWindowDrag from "./useWindowDrag";

import type { Position, SpectrogramWindow } from "@/types";

/**
 * Hook for handling window motions on a spectrogram.
 */
export default function useWindowMotions({
  viewport,
  dimensions,
  enabled = true,
  onClick,
  onMoveStart,
  onMove,
  onMoveEnd,
}: {
  /** The current spectrogram window displayed on canvas. */
  viewport: SpectrogramWindow;
  /** The dimensions of the canvas. */
  dimensions: { width: number; height: number };
  /** Whether the motion is enabled. */
  enabled?: boolean;
  /** Callback when a click occurs */
  onClick?: ({
    position,
    shift,
    ctrl,
  }: {
    position: Position;
    shift: boolean;
    ctrl: boolean;
  }) => void;
  /** Callback when motion starts.
   * A motion starts when the mouse is pressed down and starts moving.
   * It is not triggered when the mouse is pressed down but not moving.
   */
  onMoveStart?: () => void;
  /** Callback during motion.
   * This motion is triggered when the mouse is pressed down and moving.
   * Every time the mouse moves, this callback is triggered.
   */
  onMove?: ({ initial, shift }: { initial: Position; shift: Position }) => void;
  /* Callback when motion ends. */
  onMoveEnd?: () => void;
}) {
  const [initialPosition, setInitialPosition] = useState<Position | null>(null);

  const clickProps = useMemo(() => {
    const handleClick = (e: MouseEvent) => {
      if (!enabled) return;
      const point = {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      };
      const position = scalePixelsToWindow(point, viewport, dimensions);
      setInitialPosition(position);
      onClick?.({
        position,
        shift: e.shiftKey,
        ctrl: e.ctrlKey,
      });
    };

    return {
      onMouseDown: handleClick,
      onPointerDown: handleClick,
      onClick: handleClick,
    };
  }, [enabled, viewport, dimensions, onClick]);

  const handleMoveStart = useCallback(() => {
    if (!enabled) return;
    onMoveStart?.();
  }, [enabled, onMoveStart]);

  const handleMove = useCallback(
    (pos: Position) => {
      if (!enabled || initialPosition == null) return;
      onMove?.({
        initial: initialPosition,
        shift: pos,
      });
    },
    [initialPosition, enabled, onMove],
  );

  const handleMoveEnd = useCallback(() => {
    if (!enabled) return;
    setInitialPosition(null);
    onMoveEnd?.();
  }, [enabled, onMoveEnd]);

  const { moveProps, isDragging } = useWindowDrag({
    viewport,
    dimensions,
    onMoveStart: handleMoveStart,
    onMove: handleMove,
    onMoveEnd: handleMoveEnd,
  });

  const props = mergeProps(moveProps, clickProps);

  return {
    props,
    isDragging,
  };
}
