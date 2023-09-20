import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  type AnnotationProject,
  type AnnotationProjectUpdate,
} from "@/api/annotation_projects";
import api from "@/app/api";
import { type ClipCreate } from "@/api/clips";
import { type Task } from "@/api/tasks";

export default function useAnnotationProject({
  annotation_project_id,
  onUpdate,
  onDelete,
  onAddTag,
  onRemoveTag,
  onAddClips,
}: {
  annotation_project_id: number;
  onUpdate?: (annotation_project: AnnotationProject) => void;
  onDelete?: (annotation_project: AnnotationProject) => void;
  onAddTag?: (annotation_project: AnnotationProject) => void;
  onRemoveTag?: (annotation_project: AnnotationProject) => void;
  onAddClips?: (tasks: Task[]) => void;
}) {
  const client = useQueryClient();

  const query = useQuery(["annotation_project", annotation_project_id], () =>
    api.annotation_projects.get(annotation_project_id),
  );

  const update = useMutation({
    mutationFn: async (data: AnnotationProjectUpdate) => {
      return await api.annotation_projects.update(annotation_project_id, data);
    },
    onSuccess: (data) => {
      onUpdate?.(data);
      query.refetch();
    },
  });

  const addTag = useMutation({
    mutationFn: async (tag_id: number) => {
      return await api.annotation_projects.addTag(
        annotation_project_id,
        tag_id,
      );
    },
    onSuccess: (data) => {
      onAddTag?.(data);
      query.refetch();
    },
  });

  const removeTag = useMutation({
    mutationFn: async (tag_id: number) => {
      return await api.annotation_projects.removeTag(
        annotation_project_id,
        tag_id,
      );
    },
    onSuccess: (data) => {
      onRemoveTag?.(data);
      query.refetch();
    },
  });

  const delete_ = useMutation({
    mutationFn: async () => {
      return await api.annotation_projects.delete(annotation_project_id);
    },
    onSuccess: (data) => onDelete?.(data),
  });

  const addClips = useMutation({
    mutationFn: async (clips: ClipCreate[]) => {
      const created_clips = await api.clips.createMany(clips);
      return await api.tasks.createMany(created_clips.map((clip) => ({
        project_id: annotation_project_id,
        clip_id: clip.id,
      })));
    },
    onSuccess: (data) => {
      onAddClips?.(data);
      client.invalidateQueries(["tasks"]);
    }
  });

  return {
    query,
    update,
    addTag,
    addClips,
    removeTag,
    delete: delete_,
  };
}
