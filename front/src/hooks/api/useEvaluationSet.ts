import { useMemo } from "react";

import api from "@/app/api";
import useObject from "@/hooks/utils/useObject";

import type { EvaluationSet } from "@/types";
import type { AxiosError } from "axios";

export default function useEvaluationSet({
  uuid,
  evaluationSet,
  enabled = true,
  onUpdate,
  onDelete,
  onAddTag,
  onRemoveTag,
  onAddTasks,
  onError,
}: {
  uuid?: string;
  evaluationSet?: EvaluationSet;
  enabled?: boolean;
  onUpdate?: (evaluation_set: EvaluationSet) => void;
  onDelete?: (evaluation_set: EvaluationSet) => void;
  onAddTag?: (evaluation_set: EvaluationSet) => void;
  onRemoveTag?: (evaluation_set: EvaluationSet) => void;
  onAddTasks?: (evaluation_set: EvaluationSet) => void;
  onError?: (error: AxiosError) => void;
}) {
  const { query, useMutation, useDestruction } = useObject<EvaluationSet>({
    uuid,
    initial: evaluationSet,
    name: "evaluation_set",
    enabled,
    getFn: api.evaluationSets.get,
    onError,
  });

  const update = useMutation({
    mutationFn: api.evaluationSets.update,
    onSuccess: onUpdate,
    onError: console.log,
  });

  const addTag = useMutation({
    mutationFn: api.evaluationSets.addTag,
    onSuccess: onAddTag,
  });

  const removeTag = useMutation({
    mutationFn: api.evaluationSets.removeTag,
    onSuccess: onRemoveTag,
  });

  const addEvaluationTasks = useMutation({
    mutationFn: api.evaluationSets.addEvaluationTasks,
    onSuccess: onAddTasks,
  });

  const delete_ = useDestruction({
    mutationFn: api.evaluationSets.delete,
    onSuccess: onDelete,
  });

  const downloadUrl = useMemo(() => {
    if (!query.data) return "";
    return api.evaluationSets.getDownloadUrl(query.data);
  }, [query.data]);

  return {
    ...query,
    update,
    addTag,
    removeTag,
    addEvaluationTasks,
    delete: delete_,
    downloadUrl,
  } as const;
}
