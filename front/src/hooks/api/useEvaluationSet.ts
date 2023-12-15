import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/app/api";
import { type EvaluationSetUpdate } from "@/api/evaluation_sets";
import { type EvaluationSet, type Tag } from "@/api/schemas";

export default function useEvaluationSet({
  evaluationSet,
  enabled = true,
  onUpdate,
  onDelete,
  onAddTag,
  onRemoveTag,
}: {
  evaluationSet: EvaluationSet;
  enabled?: boolean;
  onUpdate?: (evaluation_set: EvaluationSet) => void;
  onDelete?: (evaluation_set: EvaluationSet) => void;
  onAddTag?: (evaluation_set: EvaluationSet) => void;
  onRemoveTag?: (evaluation_set: EvaluationSet) => void;
}) {
  const client = useQueryClient();

  const query = useQuery(
    ["evaluation_set", evaluationSet.uuid],
    () => api.evaluationSets.get(evaluationSet.uuid),
    {
      enabled,
      initialData: evaluationSet,
      staleTime: 1000 * 60 * 5,
    },
  );

  const update = useMutation({
    mutationFn: async (data: EvaluationSetUpdate) => {
      return await api.evaluationSets.update(evaluationSet, data);
    },
    onSuccess: (data) => {
      onUpdate?.(data);
      client.setQueryData(["evaluation_set", evaluationSet.uuid], data);
    },
  });

  const addTag = useMutation({
    mutationFn: async (tag: Tag) => {
      return await api.evaluationSets.addTag(evaluationSet, tag);
    },
    onSuccess: (data) => {
      onAddTag?.(data);
      client.setQueryData(["evaluation_set", evaluationSet.uuid], data);
    },
  });

  const removeTag = useMutation({
    mutationFn: async (tag: Tag) => {
      return await api.evaluationSets.removeTag(evaluationSet, tag);
    },
    onSuccess: (data) => {
      onRemoveTag?.(data);
      client.setQueryData(["evaluation_set", evaluationSet.uuid], data);
    },
  });

  const delete_ = useMutation({
    mutationFn: async () => {
      return await api.evaluationSets.delete(evaluationSet);
    },
    onSuccess: (data) => {
      onDelete?.(data);
      query.remove();
    },
  });

  return {
    ...query,
    update,
    addTag,
    removeTag,
    delete: delete_,
  } as const;
}
