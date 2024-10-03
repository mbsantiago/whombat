import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import useModelRun from "@/app/hooks/api/useModelRun";

import api from "@/app/api";

import ModelRunEvaluationBase from "@/lib/components/model_runs/ModelRunEvaluations";

import type { Evaluation, EvaluationSet, ModelRun } from "@/lib/types";

export default function ModelRunEvaluation({
  modelRun,
  evaluationSet,
  onEvaluate,
}: {
  modelRun: ModelRun;
  evaluationSet: EvaluationSet;
  onEvaluate?: (data: Evaluation) => void;
}) {
  const {
    data = modelRun,
    isLoading,
    evaluate,
  } = useModelRun({
    uuid: modelRun.uuid,
    modelRun: modelRun,
    onEvaluate,
  });

  const { data: evaluation, isLoading: isLoadingEvaluation } = useQuery({
    queryKey: [
      "evaluation",
      "model_run",
      data,
      "evaluation_set",
      evaluationSet,
    ],
    retry: false,
    queryFn: () => api.modelRuns.getEvaluation(data, evaluationSet),
  });

  return (
    <ModelRunEvaluationBase
      modelRun={data}
      evaluationSet={evaluationSet}
      evaluation={evaluation || undefined}
      isLoading={isLoading || isLoadingEvaluation}
      onEvaluate={() =>
        toast.promise(evaluate.mutateAsync(evaluationSet), {
          loading: "Evaluating model run...",
          success: "Model run evaluated",
          error: "Failed to evaluate model run",
        })
      }
    />
  );
}
