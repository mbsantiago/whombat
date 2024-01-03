import { useMemo } from "react";

import Loading from "@/app/loading";
import Empty from "@/components/Empty";
import { H4 } from "@/components/Headings";
import { AddIcon, ModelIcon } from "@/components/icons";
import Link from "@/components/Link";
import useModelRuns from "@/hooks/api/useModelRuns";

import type { EvaluationSet } from "@/types";

export default function ModelEvaluationSummary({
  evaluationSet,
  showMax = 5,
}: {
  evaluationSet: EvaluationSet;
  showMax?: number;
}) {
  const filter = useMemo(
    () => ({
      evaluation_set: evaluationSet,
    }),
    [evaluationSet],
  );
  const predictionRuns = useModelRuns({ filter, pageSize: showMax });

  return (
    <div>
      <div className="flex flex-row items-center justify-between">
        <H4>
          <ModelIcon className="h-5 w-5 inline-block mr-2" />
          Model Runs
        </H4>
        <Link
          href={`/evaluation/detail/model_runs/?evaluation_set_uuid=${evaluationSet.uuid}&import=true`}
          mode="text"
          variant="primary"
        >
          <AddIcon className="h-5 w-5 inline-block mr-2" /> Add Model Run
        </Link>
      </div>
      {predictionRuns.isLoading ? (
        <Loading />
      ) : predictionRuns.items.length > 0 ? (
        <div className="flex flex-col gap-2">
          {predictionRuns.items.map((predictionRun) => (
            <div key={predictionRun.uuid}>
              {predictionRun.name} - {predictionRun.version}
            </div>
          ))}
        </div>
      ) : (
        <Empty>No model evaluations found</Empty>
      )}
    </div>
  );
}
