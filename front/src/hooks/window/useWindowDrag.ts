import { useCallback, useState } from "react";
import { useMove } from "react-aria";

import { scalePixelsToWindow } from "@/utils/geometry";

import type { Position, SpectrogramWindow } from "@/types";

/**
 * The `useDrag` hook manages dragging behavior for an object
 * within a specified viewport.
 *
 */
export default function useWindowDrag({
  viewport,
  dimensions: { width, height },
  onMoveStart,
  onMove,
  onMoveEnd,
}: {
  viewport: SpectrogramWindow;
  dimensions: { width: number; height: number };
  onMoveStart?: () => void;
  onMove?: (shift: Position) => void;
  onMoveEnd?: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const onMoveCallback = useCallback(
    ({ deltaX, deltaY }: { deltaX: number; deltaY: number }) => {
      setPosition(({ x, y }) => ({ x: x + deltaX, y: y + deltaY }));
      if (width == null || height == null) return;
      const shift = scalePixelsToWindow(
        position,
        viewport,
        { width, height },
        true,
      );
      onMove?.(shift);
    },
    [width, height, position, viewport, onMove],
  );

  const { moveProps } = useMove({
    onMoveStart: () => {
      setPosition({ x: 0, y: 0 });
      setIsDragging(true);
      onMoveStart?.();
    },
    onMove: onMoveCallback,
    onMoveEnd: () => {
      setPosition({ x: 0, y: 0 });
      onMoveEnd?.();
    },
  });

  return {
    moveProps,
    isDragging,
    shift: position,
  };
}
