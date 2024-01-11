import { useCallback } from "react";

import drawGeometry from "@/draw/geometry";
import { BLUE } from "@/draw/styles";
import { scaleGeometryToViewport } from "@/utils/geometry";

import type { SoundEventAnnotation, SpectrogramWindow } from "@/types";

const IDLE_STYLE = {
  borderColor: BLUE,
  fillColor: BLUE,
  borderWidth: 2,
  fillAlpha: 0.1,
};

export default function useAnnotationDraw({
  viewport,
  annotations,
}: {
  viewport: SpectrogramWindow;
  annotations: SoundEventAnnotation[];
}) {
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      for (const item of annotations) {
        const geometry = scaleGeometryToViewport(
          { width: ctx.canvas.width, height: ctx.canvas.height },
          // @ts-ignore
          item.sound_event.geometry,
          viewport,
        );
        drawGeometry(ctx, geometry, IDLE_STYLE);
      }
    },
    [viewport, annotations],
  );

  return draw;
}
