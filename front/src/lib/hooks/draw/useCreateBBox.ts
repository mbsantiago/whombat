import { useCallback, useEffect, useState } from "react";

import useWindowMotions from "@/lib/hooks/window/useWindowMotions";

import { BBoxStyle, DEFAULT_BBOX_STYLE } from "@/lib/draw/bbox";
import drawGeometry from "@/lib/draw/geometry";
import type {
  BoundingBox,
  Dimensions,
  Position,
  SpectrogramWindow,
} from "@/lib/types";
import { scaleGeometryToViewport } from "@/lib/utils/geometry";

export default function useCreateBBox({
  viewport,
  dimensions,
  enabled,
  style = DEFAULT_BBOX_STYLE,
  onCreate,
}: {
  viewport: SpectrogramWindow;
  dimensions: Dimensions;
  enabled: boolean;
  style?: BBoxStyle;
  onCreate?: (bbox: BoundingBox) => void;
}) {
  const [bbox, setBBox] = useState<BoundingBox | null>(null);

  const handleMoveStart = useCallback(() => {
    setBBox(null);
  }, []);

  const handleMove = useCallback(
    ({ initial, shift }: { initial: Position; shift: Position }) => {
      const currentBBox: BoundingBox = {
        type: "BoundingBox",
        coordinates: [
          Math.min(initial.time, initial.time + shift.time),
          Math.min(initial.freq, initial.freq - shift.freq),
          Math.max(initial.time, initial.time + shift.time),
          Math.max(initial.freq, initial.freq - shift.freq),
        ],
      };
      setBBox(currentBBox);
    },
    [],
  );

  const handleMoveEnd = useCallback(() => {
    if (bbox == null) return;
    onCreate?.(bbox);
    setBBox(null);
  }, [bbox, onCreate]);

  const { props, isDragging } = useWindowMotions({
    enabled,
    viewport,
    dimensions,
    onMoveStart: handleMoveStart,
    onMove: handleMove,
    onMoveEnd: handleMoveEnd,
  });

  useEffect(() => {
    if (!enabled && bbox != null) setBBox(null);
  }, [enabled, bbox]);

  // Create a drawing function for the bbox
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!enabled || bbox == null) return;
      const scaled = scaleGeometryToViewport(dimensions, bbox, viewport);
      drawGeometry(ctx, scaled, style);
    },
    [enabled, bbox, style, viewport, dimensions],
  );

  return {
    props,
    draw,
    isDragging,
  };
}
