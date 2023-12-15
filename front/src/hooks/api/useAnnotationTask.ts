import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/app/api";
import {
  type Tag,
  type Note,
  type Feature,
  type AnnotationTask,
  type AnnotationStatus,
} from "@/api/schemas";

export default function useAnnotationTask({
  annotationTask,
  onDelete,
  onAddBadge,
  onRemoveBadge,
  enabled = true,
  withAnnotations = false,
}: {
  annotationTask: AnnotationTask;
  onDelete?: () => void;
  onAddTag?: (tag: Tag) => void;
  onAddNote?: (note: Note) => void;
  onRemoveTag?: (tag: Tag) => void;
  onAddFeature?: (feature: Feature) => void;
  onRemoveFeature?: (feature: Feature) => void;
  onUpdateFeature?: (feature: Feature) => void;
  onAddBadge?: (state: AnnotationStatus) => void;
  onRemoveBadge?: (state: AnnotationStatus) => void;
  enabled?: boolean;
  withAnnotations?: boolean;
}) {
  const client = useQueryClient();

  const query = useQuery(
    ["annotation_task", annotationTask.uuid],
    () => api.annotationTasks.get(annotationTask.uuid),
    {
      initialData: annotationTask,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      enabled,
    },
  );

  const annotationsQuery = useQuery(
    ["annotation_task_annotations", annotationTask.uuid],
    () => api.annotationTasks.getAnnotations(annotationTask),
    {
      refetchOnWindowFocus: false,
      enabled: withAnnotations,
    },
  );

  const deleteTask = useMutation({
    mutationFn: async () => {
      return await api.annotationTasks.delete(annotationTask);
    },
    onSuccess: () => {
      client.invalidateQueries(["annotation_task", annotationTask.uuid]);
      onDelete?.();
    },
  });

  const addBadge = useMutation({
    mutationFn: (state: AnnotationStatus) =>
      api.annotationTasks.addBadge(annotationTask, state),
    onSuccess: (data, state) => {
      client.setQueryData(["annotation_task", annotationTask.uuid], data);
      onAddBadge?.(state);
    },
  });

  const removeBadge = useMutation({
    mutationFn: (state: AnnotationStatus) =>
      api.annotationTasks.removeBadge(annotationTask, state),
    onSuccess: (data, badge) => {
      client.setQueryData(["annotation_task", annotationTask.uuid], data);
      onRemoveBadge?.(badge);
    },
  });

  return {
    ...query,
    addBadge,
    removeBadge,
    delete: deleteTask,
    annotations: annotationsQuery,
  } as const;
}
