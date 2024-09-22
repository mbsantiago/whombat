import { useMemo } from "react";

import type {
  Dimensions,
  Interval,
  PredictionTag,
  SoundEventPrediction,
  SpectrogramWindow,
} from "@/lib/types";
import { isGeometryInWindow } from "@/lib/utils/geometry";
import { getLabelPosition } from "@/lib/utils/tags";
import type { TagElement, TagGroup } from "@/lib/utils/tags";

const DEFAULT_INTERVAL = { min: 0.5, max: 1 };

export default function useSpectrogramPredictionTags({
  predictions,
  viewport,
  dimensions,
  threshold = DEFAULT_INTERVAL,
  onClickTag,
  active = true,
}: {
  predictions: SoundEventPrediction[];
  viewport: SpectrogramWindow;
  dimensions: Dimensions;
  threshold?: Interval;
  onClickTag?: (prediction: SoundEventPrediction, tag: PredictionTag) => void;
  active?: boolean;
}) {
  const filteredPredictions = useMemo(() => {
    return predictions.filter((prediction) => {
      // Remove predictions with confidence outside of the threshold
      if (
        prediction.score < threshold.min ||
        prediction.score > threshold.max
      ) {
        return false;
      }

      // Remove predictions outside of the viewport
      return isGeometryInWindow(prediction.sound_event.geometry, viewport);
    });
  }, [predictions, viewport, threshold]);

  const groups: TagGroup[] = useMemo(() => {
    return filteredPredictions.map((prediction) => {
      const position = getLabelPosition(prediction, viewport, dimensions);

      const group: TagElement[] =
        prediction.tags?.map((tag) => {
          return {
            score: tag.score,
            tag: tag.tag,
            onClick: () => onClickTag?.(prediction, tag),
          };
        }) || [];

      return {
        tags: group,
        position,
        annotation: prediction,
        active,
      };
    });
  }, [filteredPredictions, viewport, dimensions, active, onClickTag]);

  return groups;
}
