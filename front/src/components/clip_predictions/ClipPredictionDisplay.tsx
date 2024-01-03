import type { ClipPrediction, Interval } from "@/types";
import ClipPredictionSpectrogram from "@/components/clip_predictions/ClipPredictionSpectrogram";
import ClipPredictionTags from "@/components/clip_predictions/ClipPredictionTags";

export default function ClipPredictionDisplay(props: {
  clipPrediction: ClipPrediction;
  threshold?: Interval;
}) {
  const { clipPrediction, threshold } = props;
  return (
    <div className="grid grid-cols-4">
      <div className="col-span-3">
        <ClipPredictionSpectrogram
          clipPrediction={clipPrediction}
          threshold={threshold}
        />
      </div>
      <div>
        <ClipPredictionTags clipPrediction={clipPrediction} />
      </div>
    </div>
  );
}
