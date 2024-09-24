import { useRouter } from "next/navigation";
import { ComponentProps, useCallback, useMemo } from "react";

import useModelRuns from "@/app/hooks/api/useModelRuns";

import ModelEvaluationSummaryBase from "@/lib/components/evaluation_sets/ModelEvaluationSummary";

import type { EvaluationSet, ModelRun } from "@/lib/types";

export default function ModelEvaluationSummary({
  evaluationSet,
  showMax = 5,
  ...props
}: {
  evaluationSet: EvaluationSet;
  showMax?: number;
} & Omit<
  ComponentProps<typeof ModelEvaluationSummaryBase>,
  "isLoading" | "modelRuns"
>) {
  const router = useRouter();

  const filter = useMemo(
    () => ({
      evaluation_set: evaluationSet,
    }),
    [evaluationSet],
  );

  const { items, isLoading } = useModelRuns({ filter, pageSize: showMax });

  const handleOnAddModelRuns = useCallback(() => {
    router.push(
      `/evaluation/detail/model_runs/?evaluation_set_uuid=${evaluationSet.uuid}&import=true`,
    );
  }, [router, evaluationSet.uuid]);

  const handleClickModelRun = useCallback(
    (modelRun: ModelRun) => {
      router.push(
        `/evaluation/detail/model_run/?evaluation_set_uuid=${evaluationSet.uuid}&model_run_uuid=${modelRun.uuid}`,
      );
    },
    [evaluationSet, router],
  );

  return (
    <ModelEvaluationSummaryBase
      isLoading={isLoading}
      modelRuns={items}
      onAddModelRuns={handleOnAddModelRuns}
      onClickModelRun={handleClickModelRun}
      {...props}
    />
  );
}
