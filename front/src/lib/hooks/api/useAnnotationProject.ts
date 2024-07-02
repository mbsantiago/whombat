import { useMutation as useQueryMutation } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { useCallback, useMemo } from "react";

import { type ClipCreateMany } from "@/lib/api/clips";
import api from "@/app/api";
import useObject from "@/lib/hooks/utils/useObject";

import type { AnnotationProject, AnnotationTask } from "@/lib/types";

export default function useAnnotationProject({
  uuid,
  annotationProject,
  onUpdate,
  onDelete,
  onAddTag,
  onRemoveTag,
  onAddAnnotationTasks,
  onError,
  enabled = true,
}: {
  uuid: string;
  annotationProject?: AnnotationProject;
  onUpdate?: (annotationProject: AnnotationProject) => void;
  onDelete?: (annotationProject: AnnotationProject) => void;
  onAddTag?: (annotationProject: AnnotationProject) => void;
  onRemoveTag?: (annotationProject: AnnotationProject) => void;
  onAddAnnotationTasks?: (tasks: AnnotationTask[]) => void;
  onError?: (error: AxiosError) => void;
  enabled?: boolean;
}) {
  const { query, useMutation, client } = useObject<AnnotationProject>({
    uuid,
    initial: annotationProject,
    name: "annotation_project",
    enabled,
    getFn: api.annotationProjects.get,
    onError,
  });

  const update = useMutation({
    mutationFn: api.annotationProjects.update,
    onSuccess: onUpdate,
  });

  const addTag = useMutation({
    mutationFn: api.annotationProjects.addTag,
    onSuccess: onAddTag,
  });

  const removeTag = useMutation({
    mutationFn: api.annotationProjects.removeTag,
    onSuccess: onRemoveTag,
  });

  const delete_ = useMutation({
    mutationFn: api.annotationProjects.delete,
    onSuccess: onDelete,
  });

  const { data } = query;
  const addTasks = useCallback(
    async (clips: ClipCreateMany) => {
      if (data == null) return;
      const created_clips = await api.clips.createMany(clips);
      return await api.annotationTasks.createMany(data, created_clips);
    },
    [data],
  );

  const addAnnotationTasks = useQueryMutation({
    mutationFn: addTasks,
    onSuccess: (data) => {
      if (data == null) return;
      onAddAnnotationTasks?.(data);
      client.invalidateQueries({
        queryKey: ["annotation_project", uuid],
      });
    },
  });

  const download = useMemo(() => {
    if (data == null) return;
    return api.annotationProjects.getDownloadUrl(data);
  }, [data]);

  return {
    ...query,
    update,
    addTag,
    addAnnotationTasks,
    removeTag,
    delete: delete_,
    download,
  } as const;
}
