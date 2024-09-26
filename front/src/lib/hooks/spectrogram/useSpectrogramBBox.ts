import { useCallback, useState } from "react";

import drawBBox from "@/lib/draw/bbox";
import type {
  DrawFn,
  MoveEndHandler,
  MoveHandler,
  MoveStartHandler,
  Position,
  SpectrogramWindow,
  ViewportController,
} from "@/lib/types";
import { getViewportPosition } from "@/lib/utils/windows";

const cmp = (a: number, b: number) => a - b;
function toViewport(bbox: {
  start: Position;
  end: Position;
}): SpectrogramWindow {
  const [startTime, endTime] = [bbox.start.time, bbox.end.time].toSorted(cmp);
  const [startFreq, endFreq] = [bbox.start.freq, bbox.end.freq].toSorted(cmp);
  return {
    time: { min: startTime, max: endTime },
    freq: { min: startFreq, max: endFreq },
  };
}

export default function useSpectrogramBox({
  onCreateBox,
}: {
  viewport: ViewportController;
  onCreateBox?: (bbox: SpectrogramWindow) => void;
}): {
  onMoveStart: MoveStartHandler;
  onMoveEnd: MoveEndHandler;
  onMove: MoveHandler;
  drawFn: DrawFn;
} {
  const [bbox, setBBox] = useState<{
    start: Position | null;
    end: Position | null;
  }>({
    start: null,
    end: null,
  });

  const onMoveStart: MoveStartHandler = useCallback(({ position }) => {
    setBBox({ start: position, end: null });
  }, []);

  const onMoveEnd: MoveEndHandler = useCallback(() => {
    if (bbox.start != null && bbox.end != null) {
      const view = toViewport({ start: bbox.start, end: bbox.end });
      onCreateBox?.(view);
    }
    setBBox({ start: null, end: null });
  }, [bbox, onCreateBox]);

  const onMove: MoveHandler = useCallback(
    ({ position }) => {
      if (!bbox) return;
      setBBox((prev) => ({ ...prev, end: position }));
    },
    [bbox],
  );

  const drawFn = useCallback(
    (ctx: CanvasRenderingContext2D, viewport: SpectrogramWindow) => {
      if (bbox.start == null || bbox.end == null) return;
      const view = toViewport({ start: bbox.start, end: bbox.end });
      const { left, top, width, height } = getViewportPosition({
        width: ctx.canvas.width,
        height: ctx.canvas.height,
        viewport: view,
        bounds: viewport,
      });
      drawBBox(ctx, [left, top, left + width, top + height]);
    },
    [bbox],
  );

  return { onMoveStart, onMoveEnd, onMove, drawFn };
}
