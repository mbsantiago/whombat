import { ComponentProps, useMemo } from "react";

import useUserRuns from "@/app/hooks/api/useUserRuns";

import UserEvaluationSummaryBase from "@/lib/components/evaluation_sets/UserEvaluationSummary";

import type { EvaluationSet } from "@/lib/types";

export default function UserEvaluationSummary({
  evaluationSet,
  showMax = 5,
  ...props
}: {
  evaluationSet: EvaluationSet;
  showMax?: number;
} & Omit<
  ComponentProps<typeof UserEvaluationSummaryBase>,
  "userRuns" | "isLoading"
>) {
  const filter = useMemo(
    () => ({
      evaluation_set: evaluationSet,
    }),
    [evaluationSet],
  );
  const { items, isLoading } = useUserRuns({ filter, pageSize: showMax });

  return (
    <UserEvaluationSummaryBase
      userRuns={items}
      isLoading={isLoading}
      {...props}
    />
  );
}
