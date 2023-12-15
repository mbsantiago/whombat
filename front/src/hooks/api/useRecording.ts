import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/app/api";
import { type RecordingUpdate } from "@/api/recordings";
import {
  type Tag,
  type Note,
  type Feature,
  type Recording,
} from "@/api/schemas";
import { type NoteCreate } from "@/api/notes";

export default function useRecording({
  recording,
  onUpdate,
  onDelete,
  onAddTag,
  onAddNote,
  onRemoveTag,
  onAddFeature,
  onRemoveFeature,
  onUpdateFeature,
  enabled = true,
}: {
  recording: Recording;
  onUpdate?: (dataset: RecordingUpdate) => void;
  onDelete?: () => void;
  onAddTag?: (tag: Tag) => void;
  onAddNote?: (note: Note) => void;
  onRemoveTag?: (tag: Tag) => void;
  onAddFeature?: (feature: Feature) => void;
  onRemoveFeature?: (feature: Feature) => void;
  onUpdateFeature?: (feature: Feature) => void;
  enabled?: boolean;
}) {
  const client = useQueryClient();

  const query = useQuery(
    ["recording", recording.uuid],
    () => api.recordings.get(recording.uuid),
    {
      enabled,
      initialData: recording,
      staleTime: 1000 * 60 * 5,
    },
  );

  const update = useMutation({
    mutationFn: async (data: RecordingUpdate) => {
      return await api.recordings.update(recording, data);
    },
    onSuccess: (data) => {
      client.setQueryData(["recording", recording.uuid], data);
      onUpdate?.(data);
    },
  });

  const addTag = useMutation({
    mutationFn: async (tag: Tag) => {
      return await api.recordings.addTag(recording, tag);
    },
    onSuccess: (data, tag) => {
      client.setQueryData(["recording", recording.uuid], data);
      onAddTag?.(tag);
    },
  });

  const removeTag = useMutation({
    mutationFn: async (tag: Tag) => {
      return await api.recordings.removeTag(recording, tag);
    },
    onSuccess: (data, tag) => {
      client.setQueryData(["recording", recording.uuid], data);
      onRemoveTag?.(tag);
    },
  });

  const addNote = useMutation({
    mutationFn: async (data: NoteCreate) => {
      return await api.recordings.addNote(recording, data);
    },
    onSuccess: (data, note) => {
      client.setQueryData(["recording", recording.uuid], data);
      const createdNote = data.notes?.find((n) => n.message === note.message);
      if (createdNote != null) {
        onAddNote?.(createdNote);
      }
    },
  });

  const addFeature = useMutation({
    mutationFn: async (feature: Feature) => {
      return await api.recordings.addFeature(recording, feature);
    },
    onSuccess: (data, feature) => {
      client.setQueryData(["recording", recording.uuid], data);
      onAddFeature?.(feature);
    },
  });

  const removeFeature = useMutation({
    mutationFn: async (feature: Feature) => {
      return await api.recordings.removeFeature(recording, feature);
    },
    onSuccess: (data, feature) => {
      client.setQueryData(["recording", recording.uuid], data);
      onRemoveFeature?.(feature);
    },
  });

  const updateFeature = useMutation({
    mutationFn: async (feature: Feature) => {
      return await api.recordings.updateFeature(recording, feature);
    },
    onSuccess: (data, feature) => {
      client.setQueryData(["recording", recording.uuid], data);
      onUpdateFeature?.(feature);
    },
  });

  const deleteRecording = useMutation({
    mutationFn: async () => {
      return await api.recordings.delete(recording);
    },
    onSuccess: () => {
      query.remove();
      onDelete?.();
    },
  });

  return {
    ...query,
    update,
    addTag,
    removeTag,
    addNote,
    addFeature,
    removeFeature,
    updateFeature,
    delete: deleteRecording,
  } as const;
}
