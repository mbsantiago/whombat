import { useState, useCallback } from "react";
import { type SpectrogramWindow } from "@/api/spectrograms";
import { type Shift } from "@/hooks/window/useDrag";
import useDrag from "@/hooks/window/useDrag";

export default function useSpectrogramDrag({
  viewport,
  dimensions,
  enabled = true,
  onDragStart,
  onDrag,
  onDragEnd,
}: {
  viewport: SpectrogramWindow;
  dimensions: { width: number; height: number };
  onDragStart?: () => void;
  onDrag?: (window: SpectrogramWindow) => void;
  onDragEnd?: () => void;
  enabled?: boolean;
}) {
  const [initialWindow, setInitialWindow] = useState(viewport);

  const onMoveStart = useCallback(() => {
    if (!enabled) return;
    setInitialWindow(viewport);
    onDragStart?.();
  }, [onDragStart, viewport, enabled]);

  const onMove = useCallback(
    (pos: Shift) => {
      if (!enabled) return;
      const window = {
        time: {
          min: initialWindow.time.min - pos.time,
          max: initialWindow.time.max - pos.time,
        },
        freq: {
          min: initialWindow.freq.min + pos.freq,
          max: initialWindow.freq.max + pos.freq,
        },
      };
      onDrag?.(window);
    },
    [onDrag, initialWindow, enabled],
  );

  const onMoveEnd = useCallback(() => {
    if (!enabled) return;
    setInitialWindow(viewport);
    onDragEnd?.();
  }, [onDragEnd, viewport, enabled]);

  const { moveProps, isDragging } = useDrag({
    viewport,
    dimensions,
    onMoveStart,
    onMove,
    onMoveEnd,
  });

  return {
    dragProps: moveProps,
    isDragging,
  } as const;
}
