import type { ClipEvaluation, Interval } from "@/lib/types";
import ClipEvaluationSpectrogram from "@/components/clip_evaluations/ClipEvaluationSpectrogram";
import ClipEvaluationTags from "@/components/clip_evaluations/ClipEvaluationTags";

export default function ClipEvaluationDisplay(props: {
  clipEvaluation: ClipEvaluation;
  threshold?: Interval;
  showAnnotations?: boolean;
  showPredictions?: boolean;
}) {
  const { clipEvaluation, threshold } = props;
  return (
    <div className="grid grid-cols-4">
      <div className="col-span-3">
        <ClipEvaluationSpectrogram
          clipEvaluation={clipEvaluation}
          threshold={threshold}
          showAnnotations={props.showAnnotations}
          showPredictions={props.showPredictions}
        />
      </div>
      <div>
        <div className="flex flex-row gap-4 p-4">
          <div className="flex flex-col">
            <span className="text-md font-bold text-stone-500">Clip Score</span>
            <span className="text-lg">
              {(100 * clipEvaluation.score).toFixed(2)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-md font-bold text-stone-500">Metrics</span>
            <span className="inline-flex flex-wrap">
              {clipEvaluation.metrics?.map((metric) => (
                <div
                  key={metric.name}
                  className="flex flex-row items-center gap-2"
                >
                  <span className="text-sm text-stone-500">{metric.name}</span>
                  <span className="text-lg">
                    {(100 * metric.value).toFixed(2)}
                  </span>
                </div>
              ))}
              {clipEvaluation.metrics?.length === 0 && "-"}
            </span>
          </div>
        </div>
        <ClipEvaluationTags clipEvaluation={clipEvaluation} />
      </div>
    </div>
  );
}
