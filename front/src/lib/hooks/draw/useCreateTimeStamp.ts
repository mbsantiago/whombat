import { useCallback, useEffect, useState } from "react";

import useWindowMotions from "@/lib/hooks/window/useWindowMotions";

import drawGeometry from "@/lib/draw/geometry";
import { DEFAULT_ONSET_STYLE } from "@/lib/draw/onset";
import { type Style } from "@/lib/draw/styles";
import type {
  Dimensions,
  Position,
  SpectrogramWindow,
  TimeStamp,
} from "@/lib/types";
import { scaleGeometryToViewport } from "@/lib/utils/geometry";

export default function useCreateTimeStamp({
  viewport,
  dimensions,
  enabled = true,
  style = DEFAULT_ONSET_STYLE,
  onCreate,
}: {
  viewport: SpectrogramWindow;
  dimensions: Dimensions;
  enabled?: boolean;
  style?: Style;
  onCreate?: (timeStamp: TimeStamp) => void;
}) {
  const [timeStamp, settimeStamp] = useState<TimeStamp | null>(null);

  const handleMoveStart = useCallback(() => {
    settimeStamp(null);
  }, []);

  const handleMove = useCallback(
    ({ initial, shift }: { initial: Position; shift: Position }) => {
      const timeStamp: TimeStamp = {
        type: "TimeStamp",
        coordinates: initial.time + shift.time,
      };
      settimeStamp(timeStamp);
    },
    [],
  );

  const handleMoveEnd = useCallback(() => {
    if (timeStamp == null) return;
    onCreate?.(timeStamp);
  }, [timeStamp, onCreate]);

  const { props, isDragging } = useWindowMotions({
    enabled,
    viewport,
    dimensions,
    onMoveStart: handleMoveStart,
    onMove: handleMove,
    onMoveEnd: handleMoveEnd,
  });

  useEffect(() => {
    if (!enabled && timeStamp != null) settimeStamp(null);
  }, [enabled, timeStamp]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!enabled || timeStamp == null) return;
      const scaled = scaleGeometryToViewport(dimensions, timeStamp, viewport);
      drawGeometry(ctx, scaled, style);
    },
    [enabled, timeStamp, style, dimensions, viewport],
  );

  return {
    props,
    draw,
    isDragging,
  };
}
