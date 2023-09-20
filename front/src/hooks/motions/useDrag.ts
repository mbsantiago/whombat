import { useState } from "react";
import { useUpdateEffect } from "react-use";
import { type Position } from "@/utils/types";

export type ScratchState = {
  isScratching: boolean;
  x?: number;
  y?: number;
  dx?: number;
  dy?: number;
  docX?: number;
  docY?: number;
  posX?: number;
  posY?: number;
  elH?: number;
  elW?: number;
  elX?: number;
  elY?: number;
};

export type DragState = {
  isDragging: boolean;
  start: Position | null;
  current: Position | null;
}

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
    isDragging: isScratching,
    start: startPoint,
    current: currentPoint,
  };
}
