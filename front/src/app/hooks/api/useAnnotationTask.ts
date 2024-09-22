import { useQuery as useReactQuery } from "@tanstack/react-query";
import { type AxiosError } from "axios";

import api from "@/app/api";

import useObject from "@/lib/hooks/utils/useObject";

import type { AnnotationTask, ClipAnnotation } from "@/lib/types";

export default function useAnnotationTask({
  uuid,
  annotationTask,
  enabled = true,
  withAnnotations = false,
  onDeleteAnnotationTask,
  onAddBadge,
  onRemoveBadge,
  onError,
}: {
  uuid: string;
  annotationTask?: AnnotationTask;
  onDeleteAnnotationTask?: (task: AnnotationTask) => void;
  onAddBadge?: (task: AnnotationTask) => void;
  onRemoveBadge?: (task: AnnotationTask) => void;
  onError?: (error: AxiosError) => void;
  enabled?: boolean;
  withAnnotations?: boolean;
}) {
  const { query, useMutation, useQuery, useDestruction } =
    useObject<AnnotationTask>({
      id: uuid,
      initialData: annotationTask,
      name: "annotation_task",
      enabled,
      queryFn: api.annotationTasks.get,
      onError,
    });

  const clipAnnotation = useQuery({
    secondaryName: "annotations",
    queryFn: api.annotationTasks.getAnnotations,
    enabled: withAnnotations,
  }) as ReturnType<typeof useReactQuery<ClipAnnotation>>;

  const deleteAnnotationTask = useDestruction({
    mutationFn: api.annotationTasks.delete,
    onSuccess: onDeleteAnnotationTask,
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
    deleteAnnotationTask,
    clipAnnotation,
  } as const;
}
