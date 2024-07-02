import { useCallback } from "react";
import drawGeometry from "@/lib/draw/geometry";
import { ORANGE, GREEN, RED } from "@/lib/draw/styles";
import { scaleGeometryToViewport } from "@/lib/utils/geometry";
import type {
  SoundEventEvaluation,
  SpectrogramWindow,
  Interval,
} from "@/lib/types";

const DEFAULT_INTERVAL = {
  min: 0.5,
  max: 1,
};

export default function useMatchDraw(props: {
  viewport: SpectrogramWindow;
  matches: SoundEventEvaluation[];
  threshold?: Interval;
  showAnnotations?: boolean;
  showPredictions?: boolean;
}) {
  const {
    viewport,
    matches,
    threshold = DEFAULT_INTERVAL,
    showAnnotations = true,
    showPredictions = true,
  } = props;

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const dimensions = {
        width: ctx.canvas.width,
        height: ctx.canvas.height,
      };

      for (const match of matches) {
        let { source: prediction, target: annotation } = match;

        if (
          prediction != null &&
          (prediction.score < threshold.min || prediction.score > threshold.max)
        ) {
          // Omit prediction if it is outside of the threshold
          prediction = null;
        }

        if (annotation == null && prediction == null) continue;

        let annotationGeometry = null;
        if (annotation != null && showAnnotations) {
          annotationGeometry = scaleGeometryToViewport(
            dimensions,
            annotation.sound_event.geometry,
            viewport,
          );
        }

        let predictionGeometry = null;
        if (prediction != null && showPredictions) {
          predictionGeometry = scaleGeometryToViewport(
            dimensions,
            prediction.sound_event.geometry,
            viewport,
          );
        }

        if (annotationGeometry != null) {
          drawGeometry(ctx, annotationGeometry, {
            borderColor: predictionGeometry != null ? GREEN : ORANGE,
            fillColor: predictionGeometry != null ? GREEN : ORANGE,
            borderWidth: 2,
            fillAlpha: 0.1,
          });
        }

        if (predictionGeometry != null) {
          drawGeometry(ctx, predictionGeometry, {
            borderColor: annotationGeometry != null ? GREEN : RED,
            fillColor: annotationGeometry != null ? GREEN : RED,
            borderWidth: 2,
            fillAlpha: 0.1,
            borderDash: [5, 5],
          });
        }
      }
    },
    [matches, showAnnotations, showPredictions, threshold, viewport],
  );
  return draw;
}
