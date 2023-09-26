import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  type EvaluationSet,
  type EvaluationSetUpdate,
} from "@/api/evaluation_sets";
import api from "@/app/api";
import {
  type EvaluationTaskCreate,
  type EvaluationTask,
} from "@/api/evaluation_tasks";

export default function useEvaluationSet({
  evaluation_set_id,
  enabled = true,
  onUpdate,
  onDelete,
  onAddTag,
  onRemoveTag,
  onAddTasks,
}: {
  evaluation_set_id: number;
  enabled?: boolean;
  onUpdate?: (evaluation_set: EvaluationSet) => void;
  onDelete?: (evaluation_set: EvaluationSet) => void;
  onAddTag?: (evaluation_set: EvaluationSet) => void;
  onRemoveTag?: (evaluation_set: EvaluationSet) => void;
  onAddTasks?: (tasks: EvaluationTask[]) => void;
}) {
  const client = useQueryClient();

  const query = useQuery(
    ["evaluation_set", evaluation_set_id],
    () => api.evaluation_sets.get(evaluation_set_id),
    {
      enabled,
    },
  );

  const update = useMutation({
    mutationFn: async (data: EvaluationSetUpdate) => {
      return await api.evaluation_sets.update({ evaluation_set_id, data });
    },
    onSuccess: (data) => {
      onUpdate?.(data);
      query.refetch();
    },
  });

  const addTag = useMutation({
    mutationFn: async (tag_id: number) => {
      return await api.evaluation_sets.addTag(evaluation_set_id, tag_id);
    },
    onSuccess: (data) => {
      onAddTag?.(data);
      query.refetch();
    },
  });

  const removeTag = useMutation({
    mutationFn: async (tag_id: number) => {
      return await api.evaluation_sets.removeTag(evaluation_set_id, tag_id);
    },
    onSuccess: (data) => {
      onRemoveTag?.(data);
      query.refetch();
    },
  });

  const delete_ = useMutation({
    mutationFn: async () => {
      return await api.evaluation_sets.delete(evaluation_set_id);
    },
    onSuccess: (data) => onDelete?.(data),
  });

  const addTasks = useMutation({
    mutationFn: async (task_ids: number[]) => {
      const tasks: EvaluationTaskCreate[] = task_ids.map((task_id) => ({
        evaluation_set_id,
        task_id,
      }));
      return await api.evaluation_tasks.createMany(tasks);
    },
    onSuccess: (data) => {
      onAddTasks?.(data);
      client.invalidateQueries(["tasks"]);
    },
  });

  return {
    query,
    update,
    addTag,
    addTasks,
    removeTag,
    delete: delete_,
  };
}
