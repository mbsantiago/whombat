import { type MouseEvent, useCallback, useMemo, useState } from "react";
import { mergeProps } from "react-aria";

import type { EventKeys } from "@/lib/hooks/utils/useDrag";
import useWindowDrag from "@/lib/hooks/window/useWindowDrag";

import type { Position, SpectrogramWindow } from "@/lib/types";
import { scalePixelsToWindow } from "@/lib/utils/geometry";

/**
 * Hook for handling window motions on a spectrogram.
 */
export default function useWindowMotions({
  viewport,
  dimensions,
  enabled = true,
  onClick,
  onDoubleClick,
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
  onClick?: (
    clickProps: {
      position: Position;
    } & EventKeys,
  ) => void;
  onDoubleClick?: (
    clickProps: {
      position: Position;
    } & EventKeys,
  ) => void;
  /** Callback when motion starts.
   * A motion starts when the mouse is pressed down and starts moving.
   * It is not triggered when the mouse is pressed down but not moving.
   */
  onMoveStart?: (keys?: EventKeys) => void;
  /** Callback during motion.
   * This motion is triggered when the mouse is pressed down and moving.
   * Every time the mouse moves, this callback is triggered.
   */
  onMove?: (
    moveProps: {
      initial: Position;
      shift: Position;
    } & EventKeys,
  ) => void;
  /* Callback when motion ends. */
  onMoveEnd?: (keys?: EventKeys) => void;
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
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
      });

      if (e.detail === 2) {
        onDoubleClick?.({
          position,
          shiftKey: e.shiftKey,
          ctrlKey: e.ctrlKey,
          altKey: e.altKey,
          metaKey: e.metaKey,
        });
      }
    };

    return {
      onMouseDown: handleClick,
      onPointerDown: handleClick,
      onClick: handleClick,
    };
  }, [enabled, viewport, dimensions, onClick, onDoubleClick]);

  const handleMoveStart = useCallback(
    ({ shiftKey, ctrlKey, altKey, metaKey }: EventKeys = {}) => {
      if (!enabled) return;
      onMoveStart?.({
        shiftKey,
        ctrlKey,
        altKey,
        metaKey,
      });
    },
    [enabled, onMoveStart],
  );

  const handleMove = useCallback(
    ({
      shift,
      shiftKey,
      ctrlKey,
      altKey,
      metaKey,
    }: {
      shift: Position;
    } & EventKeys) => {
      if (!enabled || initialPosition == null) return;
      onMove?.({
        initial: initialPosition,
        shift,
        shiftKey,
        ctrlKey,
        altKey,
        metaKey,
      });
    },
    [initialPosition, enabled, onMove],
  );

  const handleMoveEnd = useCallback(
    ({ shiftKey, ctrlKey, altKey, metaKey }: EventKeys = {}) => {
      if (!enabled) return;
      setInitialPosition(null);
      onMoveEnd?.({
        shiftKey,
        ctrlKey,
        altKey,
        metaKey,
      });
    },
    [enabled, onMoveEnd],
  );

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
