import { useCallback, useState } from "react";
import { useMove } from "react-aria";

import type { EventKeys } from "@/lib/hooks/utils/useDrag";

import type { Dimensions, Position, SpectrogramWindow } from "@/lib/types";
import { scalePixelsToWindow } from "@/lib/utils/geometry";

/**
 * The `useDrag` hook manages dragging behavior for an object
 * within a specified viewport.
 *
 */
export default function useWindowDrag({
  viewport,
  dimensions,
  onMoveStart,
  onMove,
  onMoveEnd,
}: {
  viewport: SpectrogramWindow;
  dimensions: Dimensions;
  onMoveStart?: (moveStartProps?: EventKeys) => void;
  onMove?: (moveProps: { shift: Position } & EventKeys) => void;
  onMoveEnd?: (moveEndProps?: EventKeys) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMove = useCallback(
    ({
      deltaX,
      deltaY,
      shiftKey,
      altKey,
      ctrlKey,
      metaKey,
    }: { deltaX: number; deltaY: number } & EventKeys) => {
      setPosition(({ x, y }) => ({ x: x + deltaX, y: y + deltaY }));
      const shift = scalePixelsToWindow(
        {
          x: position.x + deltaX,
          y: position.y + deltaY,
        },
        viewport,
        dimensions,
        true,
      );
      onMove?.({
        shift,
        shiftKey,
        altKey,
        ctrlKey,
        metaKey,
      });
    },
    [dimensions, position, viewport, onMove],
  );

  const handleMoveStart = useCallback(
    ({ shiftKey, altKey, ctrlKey, metaKey }: EventKeys) => {
      setPosition({ x: 0, y: 0 });
      setIsDragging(true);
      onMoveStart?.({
        shiftKey,
        altKey,
        ctrlKey,
        metaKey,
      });
    },
    [onMoveStart],
  );

  const handleMoveEnd = useCallback(
    ({ shiftKey, altKey, ctrlKey, metaKey }: EventKeys) => {
      setPosition({ x: 0, y: 0 });
      onMoveEnd?.({
        shiftKey,
        altKey,
        ctrlKey,
        metaKey,
      });
    },
    [onMoveEnd],
  );

  const { moveProps } = useMove({
    onMoveStart: handleMoveStart,
    onMove: handleMove,
    onMoveEnd: handleMoveEnd,
  });

  return {
    moveProps,
    isDragging,
    shift: position,
  };
}
