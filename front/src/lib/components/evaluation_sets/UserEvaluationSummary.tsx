import { useMemo } from "react";

import useUserRuns from "@/app/hooks/api/useUserRuns";

import Loading from "@/app/loading";

import Empty from "@/lib/components/Empty";
import { TrainIcon, UserIcon } from "@/lib/components/icons";
import { H4 } from "@/lib/components/ui/Headings";
import Link from "@/lib/components/ui/Link";

import type { EvaluationSet } from "@/lib/types";

export default function UserEvaluationSummary({
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
  const predictionRuns = useUserRuns({ filter, pageSize: showMax });

  return (
    <div>
      <div className="flex flex-row justify-between items-center">
        <H4 className="whitespace-nowrap">
          <UserIcon className="inline-block mr-2 w-5 h-5" />
          User Training Sessions
        </H4>
        <Link
          href={`/evaluation/detail/user_runs/?evaluation_set_uuid=${evaluationSet.uuid}`}
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
          {predictionRuns.items.map((userRun) => (
            <div key={userRun.uuid}>
              {userRun.user.username} - {userRun.created_on.toLocaleString()}
            </div>
          ))}
        </div>
      ) : (
        <Empty>No training sessions</Empty>
      )}
    </div>
  );
}
