import { useCallback, useEffect, useState } from "react";

import useWindowMotions from "@/lib/hooks/window/useWindowMotions";

import drawGeometry from "@/lib/draw/geometry";
import { DEFAULT_INTERVAL_STYLE } from "@/lib/draw/interval";
import { type Style } from "@/lib/draw/styles";
import type {
  Dimensions,
  Position,
  SpectrogramWindow,
  TimeInterval,
} from "@/lib/types";
import { scaleGeometryToViewport } from "@/lib/utils/geometry";

export default function useCreateInterval({
  viewport,
  dimensions,
  enabled = true,
  style = DEFAULT_INTERVAL_STYLE,
  onCreate,
}: {
  viewport: SpectrogramWindow;
  dimensions: Dimensions;
  enabled?: boolean;
  style?: Style;
  onCreate?: (interval: TimeInterval) => void;
}) {
  const [interval, setInterval] = useState<TimeInterval | null>(null);

  const handleMoveStart = useCallback(() => {
    setInterval(null);
  }, []);

  const handleMove = useCallback(
    ({ initial, shift }: { initial: Position; shift: Position }) => {
      const interval: TimeInterval = {
        type: "TimeInterval",
        coordinates: [
          Math.min(initial.time, initial.time + shift.time),
          Math.max(initial.time, initial.time + shift.time),
        ],
      };
      setInterval(interval);
    },
    [],
  );

  const handleMoveEnd = useCallback(() => {
    if (interval == null) return;
    onCreate?.(interval);
  }, [interval, onCreate]);

  const { props, isDragging } = useWindowMotions({
    enabled,
    viewport,
    dimensions,
    onMoveStart: handleMoveStart,
    onMove: handleMove,
    onMoveEnd: handleMoveEnd,
  });

  useEffect(() => {
    if (!enabled && interval != null) setInterval(null);
  }, [enabled, interval]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!enabled || !isDragging || interval == null) return;
      const scaled = scaleGeometryToViewport(dimensions, interval, viewport);
      drawGeometry(ctx, scaled, style);
    },
    [enabled, interval, style, isDragging, dimensions, viewport],
  );

  return {
    props,
    draw,
    isDragging,
  };
}
