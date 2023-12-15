import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type AnnotationProjectUpdate } from "@/api/annotation_projects";
import {
  type AnnotationProject,
  type Tag,
  type AnnotationTask,
} from "@/api/schemas";
import api from "@/app/api";
import { type ClipCreate } from "@/api/clips";

export default function useAnnotationProject({
  annotationProject,
  onUpdate,
  onDelete,
  onAddTag,
  onRemoveTag,
  onAddAnnotationTask: onAddAnnotationTasks,
  enabled = true,
}: {
  annotationProject: AnnotationProject;
  onUpdate?: (annotationProject: AnnotationProject) => void;
  onDelete?: (annotationProject: AnnotationProject) => void;
  onAddTag?: (annotationProject: AnnotationProject) => void;
  onRemoveTag?: (annotationProject: AnnotationProject) => void;
  onAddAnnotationTask?: (tasks: AnnotationTask[]) => void;
  enabled?: boolean;
}) {
  const client = useQueryClient();

  const query = useQuery(
    ["annotationProject", annotationProject.uuid],
    () => api.annotationProjects.get(annotationProject.uuid),
    {
      enabled,
      initialData: annotationProject,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
    },
  );

  const update = useMutation({
    mutationFn: async (data: AnnotationProjectUpdate) => {
      return await api.annotationProjects.update(annotationProject, data);
    },
    onSuccess: (data) => {
      onUpdate?.(data);
      client.setQueryData(["annotationProject", data.uuid], data);
    },
  });

  const addTag = useMutation({
    mutationFn: async (tag: Tag) => {
      return await api.annotationProjects.addTag(annotationProject, tag);
    },
    onSuccess: (data) => {
      onAddTag?.(data);
      client.setQueryData(["annotationProject", data.uuid], data);
    },
  });

  const removeTag = useMutation({
    mutationFn: async (tag: Tag) => {
      return await api.annotationProjects.removeTag(annotationProject, tag);
    },
    onSuccess: (data) => {
      onRemoveTag?.(data);
      client.setQueryData(["annotationProject", data.uuid], data);
    },
  });

  const delete_ = useMutation({
    mutationFn: async () => {
      return await api.annotationProjects.delete(annotationProject);
    },
    onSuccess: (data) => {
      onDelete?.(data);
      client.removeQueries(["annotationProject", data.uuid]);
      client.invalidateQueries(["annotationProjects"]);
    },
  });

  const addAnnotationTasks = useMutation({
    mutationFn: async (clips: ClipCreate[]) => {
      const created_clips = await api.clips.createMany(clips);
      return await api.annotationTasks.createMany(
        annotationProject,
        created_clips,
      );
    },
    onSuccess: (data) => {
      onAddAnnotationTasks?.(data);
      client.invalidateQueries(["annotationTasks"]);
    },
  });

  return {
    ...query,
    update,
    addTag,
    addAnnotationTasks,
    removeTag,
    delete: delete_,
  } as const;
}
