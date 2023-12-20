import { useMemo } from "react";

import { H4 } from "@/components/Headings";
import { type EvaluationSet } from "@/api/schemas";
import { UserIcon, TrainIcon } from "@/components/icons";
import Link from "@/components/Link";
import Loading from "@/app/loading";
import Empty from "@/components/Empty";
import useModelRuns from "@/hooks/api/useModelRuns";

export default function UserEvaluationSummary({
  evaluationSet,
  showMax = 5,
}: {
  evaluationSet: EvaluationSet;
  showMax?: number;
}) {
  const filter = useMemo(
    () => ({
      evaluation_set__eq: evaluationSet.uuid,
      is_model__eq: false,
    }),
    [evaluationSet.uuid],
  );
  const predictionRuns = useModelRuns({ filter, pageSize: showMax });

  return (
    <div>
      <div className="flex flex-row justify-between items-center">
        <H4 className="whitespace-nowrap">
          <UserIcon className="inline-block mr-2 w-5 h-5" />
          User Training Sessions
        </H4>
        <Link
          href={`/evaluation/detail/train/new/?evaluation_set_uuid=${evaluationSet.uuid}`}
          mode="text"
          variant="primary"
        >
          <TrainIcon className="inline-block mr-2 w-5 h-5" /> Start New
        </Link>
      </div>
      {predictionRuns.isLoading ? (
        <Loading />
      ) : predictionRuns.items.length > 0 ? (
        <div className="flex flex-col gap-2">
          {predictionRuns.items.map((modelRun) => (
            <div key={modelRun.uuid}>
              {modelRun.name} - {modelRun.version}
            </div>
          ))}
        </div>
      ) : (
        <Empty>No training sessions</Empty>
      )}
    </div>
  );
}
