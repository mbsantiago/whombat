import ClipPredictionSpectrogram from "@/lib/components/clip_predictions/ClipPredictionSpectrogram";
import ClipPredictionTags from "@/lib/components/clip_predictions/ClipPredictionTags";
import type { ClipPrediction, Interval } from "@/lib/types";

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
