import { useCallback, useMemo, useState } from "react";
import type { DOMAttributes, MouseEvent } from "react";
import { mergeProps, useMove } from "react-aria";

import type { Pixel } from "@/lib/types";

export type EventKeys = {
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
};

export default function useDrag<T>({
  enabled = true,
  onClick,
  onMoveStart,
  onMove,
  onMoveEnd,
}: {
  enabled?: boolean;
  onClick?: (
    clickProps: {
      position: Pixel;
    } & EventKeys,
  ) => void;
  onMoveStart?: (moveStartProps?: EventKeys) => void;
  onMove?: (
    moveProps: {
      initial: Pixel;
      current: Pixel;
    } & EventKeys,
  ) => void;
  onMoveEnd?: (moveEndProps?: EventKeys) => void;
}): {
  props: DOMAttributes<T>;
  isDragging: boolean;
} {
  const [isDragging, setIsDragging] = useState(false);
  const [shift, setShift] = useState<Pixel>({ x: 0, y: 0 });
  const [initialPosition, setInitialPosition] = useState<Pixel | null>(null);

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
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        altKey: e.altKey,
      });
    };

    return {
      onMouseDown: handleClick,
      onPointerDown: handleClick,
      onClick: handleClick,
    };
  }, [enabled, onClick]);

  const handleMoveStart = useCallback(
    ({ shiftKey, ctrlKey, altKey, metaKey }: EventKeys = {}) => {
      if (!enabled) return;
      setShift({ x: 0, y: 0 });
      setIsDragging(true);
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
      deltaX,
      deltaY,
      shiftKey,
      ctrlKey,
      altKey,
      metaKey,
    }: {
      deltaX: number;
      deltaY: number;
    } & EventKeys) => {
      if (!enabled || initialPosition == null) return;
      setShift(({ x, y }) => ({ x: x + deltaX, y: y + deltaY }));
      onMove?.({
        initial: initialPosition,
        current: {
          x: initialPosition.x + shift.x + deltaX,
          y: initialPosition.y + shift.y + deltaY,
        },
        shiftKey,
        ctrlKey,
        altKey,
        metaKey,
      });
    },
    [enabled, initialPosition, shift, onMove],
  );

  const handleMoveEnd = useCallback(
    ({ shiftKey, ctrlKey, altKey, metaKey }: EventKeys = {}) => {
      if (!enabled) return;
      setInitialPosition(null);
      setIsDragging(false);
      setShift({ x: 0, y: 0 });
      onMoveEnd?.({
        shiftKey,
        ctrlKey,
        altKey,
        metaKey,
      });
    },
    [enabled, onMoveEnd],
  );

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
