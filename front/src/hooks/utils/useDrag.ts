import { useCallback, useMemo, useState } from "react";
import { mergeProps, useMove } from "react-aria";

import type { DOMAttributes, MouseEvent } from "react";

export type Point = { x: number; y: number };

export default function useDrag<T>({
  enabled = true,
  onClick,
  onMoveStart,
  onMove,
  onMoveEnd,
}: {
  enabled?: boolean;
  onClick?: ({
    position,
    shift,
    ctrl,
  }: {
    position: Point;
    shift: boolean;
    ctrl: boolean;
  }) => void;
  onMoveStart?: () => void;
  onMove?: ({
    initial,
    current,
    shift,
    ctrl,
  }: {
    initial: Point;
    current: Point;
    shift: boolean;
    ctrl: boolean;
  }) => void;
  onMoveEnd?: () => void;
}): {
  props: DOMAttributes<T>;
  isDragging: boolean;
} {
  const [isDragging, setIsDragging] = useState(false);
  const [shift, setShift] = useState<Point>({ x: 0, y: 0 });
  const [initialPosition, setInitialPosition] = useState<Point | null>(null);

  const clickProps = useMemo(() => {
    if (!enabled) return {};

    const handleClick = (e: MouseEvent<T>) => {
      if (!enabled) return;
      const point = {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      };
      setInitialPosition(point);
      onClick?.({
        position: point,
        shift: e.shiftKey,
        ctrl: e.ctrlKey,
      });
    };

    return {
      onMouseDown: handleClick,
      onPointerDown: handleClick,
      onClick: handleClick,
    };
  }, [enabled, onClick]);

  const handleMoveStart = useCallback(() => {
    if (!enabled) return;
    setShift({ x: 0, y: 0 });
    setIsDragging(true);
    onMoveStart?.();
  }, [enabled, onMoveStart]);

  const handleMove = useCallback(
    ({
      deltaX,
      deltaY,
      shiftKey,
      ctrlKey,
    }: {
      deltaX: number;
      deltaY: number;
      shiftKey: boolean;
      ctrlKey: boolean;
    }) => {
      if (!enabled || initialPosition == null) return;
      setShift(({ x, y }) => ({ x: x + deltaX, y: y + deltaY }));
      onMove?.({
        initial: initialPosition,
        current: {
          x: initialPosition.x + shift.x + deltaX,
          y: initialPosition.y + shift.y + deltaY,
        },
        shift: shiftKey,
        ctrl: ctrlKey,
      });
    },
    [enabled, initialPosition, shift, onMove],
  );

  const handleMoveEnd = useCallback(() => {
    if (!enabled) return;
    setInitialPosition(null);
    setIsDragging(false);
    setShift({ x: 0, y: 0 });
    onMoveEnd?.();
  }, [enabled, onMoveEnd]);

  const { moveProps } = useMove({
    onMoveStart: handleMoveStart,
    onMove: handleMove,
    onMoveEnd: handleMoveEnd,
  });

  const props = enabled ? mergeProps(moveProps, clickProps) : {};
  return {
    props,
    isDragging,
  };
}
