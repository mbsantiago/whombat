import { useCallback, useState } from "react";

import useWindowDrag from "@/lib/hooks/window/useWindowDrag";
import useWindowMotions from "@/lib/hooks/window/useWindowMotions";

import type { Position, SpectrogramWindow } from "@/lib/types";

export default function useSpectrogramDrag({
  viewport,
  dimensions,
  enabled = true,
  onDoubleClick,
  onDragStart,
  onDrag,
  onDragEnd,
}: {
  viewport: SpectrogramWindow;
  dimensions: { width: number; height: number };
  onDoubleClick?: (dblClickProps: {
    position: Position;
    shiftKey?: boolean;
    altKey?: boolean;
  }) => void;
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
    ({ shift }: { shift: Position }) => {
      if (!enabled) return;
      const window = {
        time: {
          min: initialWindow.time.min - shift.time,
          max: initialWindow.time.max - shift.time,
        },
        freq: {
          min: initialWindow.freq.min + shift.freq,
          max: initialWindow.freq.max + shift.freq,
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

  const { props: moveProps, isDragging } = useWindowMotions({
    viewport,
    dimensions,
    onMoveStart,
    onMove,
    onMoveEnd,
    onDoubleClick,
  });

  return {
    dragProps: moveProps,
    isDragging,
  } as const;
}
