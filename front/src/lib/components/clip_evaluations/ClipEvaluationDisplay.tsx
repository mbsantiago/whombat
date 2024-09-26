import type { FC } from "react";

import TagComparison from "@/lib/components/tags/TagComparison";

import type { ClipEvaluation } from "@/lib/types";

export default function ClipEvaluationDisplay(props: {
  clipEvaluation: ClipEvaluation;
  threshold?: number;
  showAnnotations?: boolean;
  showPredictions?: boolean;
  ClipEvaluationSpectrogram?: FC<{
    clipEvaluation: ClipEvaluation;
    threshold?: number;
    showAnnotations?: boolean;
    showPredictions?: boolean;
  }>;
}) {
  const { clipEvaluation, threshold } = props;
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="col-span-1">
        {props.ClipEvaluationSpectrogram != null && (
          <props.ClipEvaluationSpectrogram
            clipEvaluation={clipEvaluation}
            threshold={threshold}
            showAnnotations={props.showAnnotations}
            showPredictions={props.showPredictions}
          />
        )}
      </div>
      <div>
        <div className="flex flex-row gap-4 p-4">
          <div className="flex flex-col">
            <span className="font-bold text-md text-stone-500">Clip Score</span>
            <span className="text-lg">
              {(100 * clipEvaluation.score).toFixed(2)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-md text-stone-500">Metrics</span>
            <span className="inline-flex flex-wrap gap-4">
              {clipEvaluation.metrics?.map((metric) => (
                <div
                  key={metric.name}
                  className="flex flex-row gap-2 items-center"
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
        <TagComparison
          tags={clipEvaluation.clip_annotation.tags || undefined}
          predictedTags={clipEvaluation.clip_prediction.tags || undefined}
          threshold={threshold}
        />
      </div>
    </div>
  );
}
