import { useState } from "react";
import { useUpdateEffect } from "react-use";

import { type Position } from "@/utils/types";
import { type ScratchState } from "@/hooks/motions/useScratch";

export { type ScratchState };

export type DragState = {
  isDragging: boolean;
  start: Position | null;
  current: Position | null;
};

export default function useDrag({
  dragState,
  active = true,
  onDragStart,
  onDrag,
  onDragEnd,
}: {
  dragState: ScratchState;
  active?: boolean;
  onDragStart?: (pos: Position) => void;
  onDrag?: (pos: Position) => void;
  onDragEnd?: (pos: Position) => void;
}) {
  const [startPoint, setStartPoint] = useState<Position | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Position | null>(null);

  const { isScratching, x, y, dx, dy } = dragState;

  useUpdateEffect(() => {
    if (active) {
      if (isScratching && startPoint == null) {
        if (x != null && y != null) {
          setStartPoint([x, y]);
          onDragStart?.([x, y]);
        }
      } else if (!isScratching && startPoint != null) {
        setStartPoint(null);
        setCurrentPoint(null);
        onDragEnd?.(currentPoint ?? startPoint);
      }
    }
  }, [isScratching, active, x, y]);

  useUpdateEffect(() => {
    if (
      active &&
      startPoint != null &&
      isScratching &&
      dx != null &&
      dy != null
    ) {
      const [x, y] = startPoint;
      setCurrentPoint([x + dx, y + dy]);
      onDrag?.([x + dx, y + dy]);
    }
  }, [active, startPoint, isScratching, dx, dy]);

  return {
    isDragging: isScratching && active,
    start: startPoint,
    current: currentPoint,
  };
}
