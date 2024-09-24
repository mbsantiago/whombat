import type { AxiosError } from "axios";

import api from "@/app/api";

import useObject from "@/lib/hooks/utils/useObject";

import type {
  Evaluation,
  EvaluationSet,
  ModelRun,
  ModelRunUpdate,
} from "@/lib/types";

export default function useModelRun({
  uuid,
  modelRun,
  enabled = true,
  onUpdate,
  onDelete,
  onEvaluate,
  onError,
}: {
  uuid: string;
  modelRun?: ModelRun;
  enabled?: boolean;
  withState?: boolean;
  onUpdate?: (updated: ModelRun) => void;
  onEvaluate?: (evaluation: Evaluation) => void;
  onDelete?: (deleted: ModelRun) => void;
  onError?: (error: AxiosError) => void;
}) {
  if (modelRun !== undefined && modelRun.uuid !== uuid) {
    throw new Error("Model Run uuid does not match");
  }

  const { query, useMutation, useQuery, useDestruction } = useObject<ModelRun>({
    id: uuid,
    initialData: modelRun,
    name: "model_run",
    enabled,
    queryFn: api.modelRuns.get,
    onError,
  });

  const update = useMutation<ModelRunUpdate>({
    mutationFn: api.modelRuns.update,
    onSuccess: onUpdate,
  });

  const evaluate = useMutation<EvaluationSet, Evaluation>({
    mutationFn: api.modelRuns.evaluate,
    onSuccess: onEvaluate,
    withUpdate: false,
  });

  const delete_ = useDestruction({
    mutationFn: api.modelRuns.delete,
    onSuccess: onDelete,
  });

  return {
    ...query,
    update,
    delete: delete_,
    evaluate,
    useQuery,
  };
}
