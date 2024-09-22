import type { AxiosError } from "axios";
import { useMemo } from "react";

import api from "@/app/api";

import useObject from "@/lib/hooks/utils/useObject";

import type { EvaluationSet, EvaluationSetUpdate } from "@/lib/types";

export default function useEvaluationSet({
  uuid,
  evaluationSet,
  enabled = true,
  onAddModelRun,
  onAddUserRun,
  onUpdate,
  onDelete,
  onAddTag,
  onRemoveTag,
  onAddTasks,
  onError,
}: {
  uuid: string;
  evaluationSet?: EvaluationSet;
  enabled?: boolean;
  onUpdate?: (evaluation_set: EvaluationSet) => void;
  onDelete?: (evaluation_set: EvaluationSet) => void;
  onAddTag?: (evaluation_set: EvaluationSet) => void;
  onRemoveTag?: (evaluation_set: EvaluationSet) => void;
  onAddTasks?: (evaluation_set: EvaluationSet) => void;
  onAddModelRun?: (evaluation_set: EvaluationSet) => void;
  onAddUserRun?: (evaluation_set: EvaluationSet) => void;
  onError?: (error: AxiosError) => void;
}) {
  const { query, useMutation, useDestruction } = useObject<EvaluationSet>({
    id: uuid,
    initialData: evaluationSet,
    name: "evaluation_set",
    enabled,
    queryFn: api.evaluationSets.get,
    onError,
  });

  const update = useMutation<EvaluationSetUpdate>({
    mutationFn: api.evaluationSets.update,
    onSuccess: onUpdate,
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

  const addModelRun = useMutation({
    mutationFn: api.evaluationSets.addModelRun,
    onSuccess: onAddModelRun,
  });

  const addUserRun = useMutation({
    mutationFn: api.evaluationSets.addUserRun,
    onSuccess: onAddUserRun,
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
    addModelRun,
    addUserRun,
    delete: delete_,
    downloadUrl,
  } as const;
}
