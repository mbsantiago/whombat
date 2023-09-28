import { useMemo } from "react";

import { H4 } from "@/components/Headings";
import { type EvaluationSet } from "@/api/evaluation_sets";
import { ModelIcon, AddIcon } from "@/components/icons";
import Link from "@/components/Link";
import Loading from "@/app/loading";
import Empty from "@/components/Empty";
import usePredictionRuns from "@/hooks/api/usePredictionRuns";

export default function ModelEvaluationSummary({
  evaluationSet,
  showMax = 5,
}: {
  evaluationSet: EvaluationSet;
  showMax?: number;
}) {
  const filter = useMemo(
    () => ({
      evaluation_set__eq: evaluationSet.id,
      is_model__eq: true,
    }),
    [evaluationSet.id],
  );
  const predictionRuns = usePredictionRuns({ filter, pageSize: showMax });

  return (
    <div>
      <div className="flex flex-row items-center justify-between">
        <H4>
          <ModelIcon className="h-5 w-5 inline-block mr-2" />
          Model Evaluations
        </H4>
        <Link
          href={`/evaluation/detail/model_runs/create/?evaluation_set_id=${evaluationSet.id}`}
          mode="text"
          variant="primary"
        >
          <AddIcon className="h-5 w-5 inline-block mr-2" /> Add Model Runs
        </Link>
      </div>
      {predictionRuns.query.isLoading ? (
        <Loading />
      ) : predictionRuns.items.length > 0 ? (
        <div className="flex flex-col gap-2">
          {predictionRuns.items.map((predictionRun) => (
            <div key={predictionRun.id}>
              {predictionRun.model_name} - {predictionRun.model_version}
            </div>
          ))}
        </div>
      ) : (
        <Empty>No model evaluations found</Empty>
      )}
    </div>
  );
}
