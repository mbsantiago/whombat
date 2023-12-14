import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/app/api";
import { type Tag } from "@/api/tags";
import { type Note, type NoteCreate, type NoteUpdate } from "@/api/notes";
import { type Feature } from "@/api/features";
import { type StatusBadge, type State, type TaskTag } from "@/api/tasks";

export default function useTask({
  task_id,
  onDelete,
  onAddTag,
  onAddNote,
  onRemoveTag,
  onAddBadge,
  onRemoveBadge,
}: {
  task_id: number;
  onDelete?: () => void;
  onAddTag?: (tag: Tag) => void;
  onAddNote?: (note: Note) => void;
  onRemoveTag?: (tag: Tag) => void;
  onAddFeature?: (feature: Feature) => void;
  onRemoveFeature?: (feature: Feature) => void;
  onUpdateFeature?: (feature: Feature) => void;
  onAddBadge?: (state: State) => void;
  onRemoveBadge?: (badge: StatusBadge) => void;
}) {
  const client = useQueryClient();

  const query = useQuery(["task", task_id], () => api.annotation_tasks.get(task_id), {
    refetchOnWindowFocus: false,
  });

  const addTag = useMutation({
    mutationFn: async (tag: Tag) => {
      return await api.annotation_tasks.addTag({ task_id, tag_id: tag.id });
    },
    onSuccess: (data, tag) => {
      client.setQueryData(["task", task_id], data);
      onAddTag?.(tag);
    },
  });

  const removeTag = useMutation({
    mutationFn: async (tag: TaskTag) => {
      return await api.annotation_tasks.removeTag({ task_id, tag_id: tag.id });
    },
    onSuccess: (data, tag) => {
      client.setQueryData(["task", task_id], data);
      onRemoveTag?.(tag.tag);
    },
  });

  const addNote = useMutation({
    mutationFn: async (note: NoteCreate) => {
      return await api.annotation_tasks.addNote({ task_id, ...note });
    },
    onSuccess: (data, note) => {
      client.setQueryData(["task", task_id], data);
      const createdNote = data.notes.find((n) => n.message === note.message);
      if (createdNote != null) {
        onAddNote?.(createdNote);
      }
    },
  });

  const updateNote = useMutation({
    mutationFn: async ({
      note_id,
      data,
    }: {
      note_id: number;
      data: NoteUpdate;
    }) => {
      return await api.annotation_tasks.updateNote({ task_id, note_id, data });
    },
    onSuccess: (data) => {
      client.setQueryData(["task", task_id], data);
    },
  });

  const removeNote = useMutation({
    mutationFn: async (note_id: number) => {
      return await api.annotation_tasks.removeNote({
        task_id,
        note_id,
      });
    },
    onSuccess: (data) => {
      return client.setQueryData(["task", task_id], data);
    },
  });

  const deleteTask = useMutation({
    mutationFn: async () => {
      return await api.annotation_tasks.delete(task_id);
    },
    onSuccess: () => {
      // Update the local cache
      client.invalidateQueries(["task", task_id]);
      onDelete?.();
    },
  });

  const addBadge = useMutation({
    mutationFn: (state: State) => api.annotation_tasks.addBadge({ task_id, state }),
    onSuccess: (data, state) => {
      client.setQueryData(["task", task_id], data);
      onAddBadge?.(state);
    },
  });

  const removeBadge = useMutation({
    mutationFn: (badge: StatusBadge) =>
      api.annotation_tasks.removeBadge(task_id, badge.id),
    onSuccess: (data, badge) => {
      client.setQueryData(["task", task_id], data);
      onRemoveBadge?.(badge);
    },
  });

  const clearTags = useCallback(async () => {
    for (const tag of query.data?.tags ?? []) {
      await removeTag.mutateAsync(tag);
    }
  }, [query.data?.tags, removeTag]);

  return {
    query,
    addTag,
    removeTag,
    addNote,
    removeNote,
    updateNote,
    addBadge,
    removeBadge,
    delete: deleteTask,
    clearTags,
  };
}
