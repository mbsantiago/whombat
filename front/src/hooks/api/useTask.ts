import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/app/api";
import { type Tag } from "@/api/tags";
import { type Note, type NoteCreate, type NoteUpdate } from "@/api/notes";
import { type Feature } from "@/api/features";

export default function useTask({
  task_id,
  onDelete,
  onAddTag,
  onAddNote,
  onRemoveTag,
}: {
  task_id: number;
  onDelete?: () => void;
  onAddTag?: (tag: Tag) => void;
  onAddNote?: (note: Note) => void;
  onRemoveTag?: (tag: Tag) => void;
  onAddFeature?: (feature: Feature) => void;
  onRemoveFeature?: (feature: Feature) => void;
  onUpdateFeature?: (feature: Feature) => void;
}) {
  const client = useQueryClient();

  const query = useQuery(["task", task_id], () =>
    api.tasks.get(task_id),
  );

  const addTag = useMutation({
    mutationFn: async (tag: Tag) => {
      return await api.tasks.addTag({ task_id, tag_id: tag.id });
    },
    onSuccess: (data, tag) => {
      client.setQueryData(["task", task_id], data);
      onAddTag?.(tag);
    },
  });

  const removeTag = useMutation({
    mutationFn: async (tag: Tag) => {
      return await api.tasks.removeTag({ task_id, tag_id: tag.id });
    },
    onSuccess: (data, tag) => {
      client.setQueryData(["task", task_id], data);
      onRemoveTag?.(tag);
    },
  });

  const addNote = useMutation({
    mutationFn: async (note: NoteCreate) => {
      return await api.tasks.addNote({ task_id, ...note });
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
    mutationFn: async ({ note_id, data }: {
      note_id: number;
      data: NoteUpdate;
    }) => {
      return await api.tasks.updateNote({task_id, note_id, data});
    },
    onSuccess: (data) => {
      client.setQueryData(["task", task_id], data);
    },
  });

  const removeNote = useMutation({
    mutationFn: async (note_id: number) => {
      return await api.tasks.removeNote({
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
      return await api.tasks.delete(task_id);
    },
    onSuccess: () => {
      // Update the local cache
      client.invalidateQueries(["task", task_id]);
      onDelete?.();
    },
  });

  return {
    query,
    addTag,
    removeTag,
    addNote,
    removeNote,
    updateNote,
    delete: deleteTask,
  };
}
