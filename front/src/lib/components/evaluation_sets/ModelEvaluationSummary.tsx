import { useMemo } from "react";

import useModelRuns from "@/app/hooks/api/useModelRuns";

import Loading from "@/app/loading";

import Empty from "@/lib/components/Empty";
import { AddIcon, ModelIcon } from "@/lib/components/icons";
import { H4 } from "@/lib/components/ui/Headings";
import Link from "@/lib/components/ui/Link";

import type { EvaluationSet } from "@/lib/types";

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
  const modelRuns = useModelRuns({ filter, pageSize: showMax });

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
      {modelRuns.isLoading ? (
        <Loading />
      ) : modelRuns.items.length > 0 ? (
        <ul className="gap-2 list-disc list-inside">
          {modelRuns.items.map((modelRun) => (
            <li key={modelRun.uuid}>
              <div className="inline-flex gap-2 items-baseline">
                <Link
                  mode="text"
                  padding="p-0"
                  href={`/evaluation/detail/model_run/?evaluation_set_uuid=${evaluationSet.uuid}&model_run_uuid=${modelRun.uuid}`}
                >
                  {modelRun.name}
                </Link>
                <span className="text-stone-500 text-sm">
                  {modelRun.version}
                </span>
              </div>
              <div className="text-stone-500 text-xs">
                {modelRun.created_on.toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>No model evaluations found</Empty>
      )}
    </div>
  );
}
