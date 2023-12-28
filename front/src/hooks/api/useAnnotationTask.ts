import { type AxiosError } from "axios";

import api from "@/app/api";
import useObject from "@/hooks/utils/useObject";

import type { AnnotationTask } from "@/types";

export default function useAnnotationTask({
  uuid,
  annotationTask,
  enabled = true,
  withAnnotations = false,
  onDelete,
  onAddBadge,
  onRemoveBadge,
  onError,
}: {
  uuid: string;
  annotationTask?: AnnotationTask;
  onDelete?: (task: AnnotationTask) => void;
  onAddBadge?: (task: AnnotationTask) => void;
  onRemoveBadge?: (task: AnnotationTask) => void;
  onError?: (error: AxiosError) => void;
  enabled?: boolean;
  withAnnotations?: boolean;
}) {
  const { query, useMutation, useQuery, useDestruction } =
    useObject<AnnotationTask>({
      uuid,
      initial: annotationTask,
      name: "annotation_task",
      enabled,
      getFn: api.annotationTasks.get,
      onError,
    });

  const annotationsQuery = useQuery({
    name: "annotations",
    queryFn: api.annotationTasks.getAnnotations,
    enabled: withAnnotations,
  });

  const deleteTask = useDestruction({
    mutationFn: api.annotationTasks.delete,
    onSuccess: onDelete,
  });

  const addBadge = useMutation({
    mutationFn: api.annotationTasks.addBadge,
    onSuccess: onAddBadge,
  });

  const removeBadge = useMutation({
    mutationFn: api.annotationTasks.removeBadge,
    onSuccess: onRemoveBadge,
  });

  return {
    ...query,
    addBadge,
    removeBadge,
    delete: deleteTask,
    annotations: annotationsQuery,
  } as const;
}
