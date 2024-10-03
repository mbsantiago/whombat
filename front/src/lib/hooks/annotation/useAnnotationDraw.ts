import { useCallback } from "react";

import drawGeometry from "@/lib/draw/geometry";
import { BLUE } from "@/lib/draw/styles";
import type { SoundEventAnnotation, SpectrogramWindow } from "@/lib/types";
import { scaleGeometryToViewport } from "@/lib/utils/geometry";

const IDLE_STYLE = {
  borderColor: BLUE,
  fillColor: BLUE,
  borderWidth: 2,
  fillAlpha: 0.1,
};

export default function useSoundEventDraw({
  viewport,
  soundEvents: annotations,
}: {
  viewport: SpectrogramWindow;
  soundEvents: SoundEventAnnotation[];
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
