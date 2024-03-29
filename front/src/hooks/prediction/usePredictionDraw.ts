import { useCallback } from "react";
import drawGeometry from "@/draw/geometry";
import { ORANGE } from "@/draw/styles";
import { scaleGeometryToViewport } from "@/utils/geometry";
import type { SoundEventPrediction, SpectrogramWindow, Interval } from "@/types";

const IDLE_STYLE = {
  borderColor: ORANGE,
  fillColor: ORANGE,
  borderWidth: 2,
  fillAlpha: 0.1,
};

const DEFAULT_INTERVAL = {
  min: 0.5,
  max: 1,
}

export default function usePredictionDraw(props: {
  viewport: SpectrogramWindow;
  predictions: SoundEventPrediction[];
  threshold?: Interval;
}) {
  const { viewport, predictions, threshold = DEFAULT_INTERVAL } = props;

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      for (const item of predictions) {
        if (item.score < threshold.min || item.score > threshold.max) {
          continue;
        }

        const geometry = scaleGeometryToViewport(
          { width: ctx.canvas.width, height: ctx.canvas.height },
          item.sound_event.geometry,
          viewport,
        );
        drawGeometry(ctx, geometry, {
          ...IDLE_STYLE,
          borderAlpha: item.score,
        });
      }
    },
    [viewport, predictions, threshold],
  );

  return draw;
}
