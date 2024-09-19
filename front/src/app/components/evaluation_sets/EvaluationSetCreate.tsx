import { useCallback } from "react";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

import api from "@/app/api";
import EvaluationSetCreateBase from "@/lib/components/evaluation_sets/EvaluationSetCreate";

import type { AxiosError } from "axios";
import type { EvaluationSet } from "@/lib/types";
import type { EvaluationSetCreate } from "@/lib/api/evaluation_sets";

export default function EvaluationSetCreate({
  onCreateEvaluationSet,
  onError,
}: {
  onCreateEvaluationSet?: (project: EvaluationSet) => void;
  onError?: (error: AxiosError) => void;
}) {
  const { mutate } = useMutation({
    mutationFn: api.evaluationSets.create,
    onError: onError,
    onSuccess: onCreateEvaluationSet,
  });

  const handleCreateProject = useCallback(
    async (data: EvaluationSetCreate) => {
      mutate(data, {
        onSuccess: () => toast.success("Evaluation set created"),
      });
    },
    [mutate],
  );

  return (
    <EvaluationSetCreateBase onCreateEvaluationSet={handleCreateProject} />
  );
}
