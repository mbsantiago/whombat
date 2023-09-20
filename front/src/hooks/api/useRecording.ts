import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/app/api";
import { type RecordingUpdate } from "@/api/recordings";
import { type Tag } from "@/api/tags";
import { type Note, type NoteCreate, type NoteUpdate } from "@/api/notes";
import { type Feature } from "@/api/features";

export default function useRecording({
  recording_id,
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
  recording_id: number;
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
    ["recording", recording_id],
    () => api.recordings.get(recording_id),
    {
      enabled,
    },
  );

  const update = useMutation({
    mutationFn: async (data: RecordingUpdate) => {
      return await api.recordings.update(recording_id, data);
    },
    onSuccess: (data) => {
      client.setQueryData(["recording", recording_id], data);
      onUpdate?.(data);
    },
  });

  const addTag = useMutation({
    mutationFn: async (tag: Tag) => {
      return await api.recordings.addTag({ recording_id, tag_id: tag.id });
    },
    onSuccess: (data, tag) => {
      client.setQueryData(["recording", recording_id], data);
      onAddTag?.(tag);
    },
  });

  const removeTag = useMutation({
    mutationFn: async (tag: Tag) => {
      return await api.recordings.removeTag({ recording_id, tag_id: tag.id });
    },
    onSuccess: (data, tag) => {
      client.setQueryData(["recording", recording_id], data);
      onRemoveTag?.(tag);
    },
  });

  const addNote = useMutation({
    mutationFn: async (note: NoteCreate) => {
      return await api.recordings.addNote({ recording_id, ...note });
    },
    onSuccess: (data, note) => {
      client.setQueryData(["recording", recording_id], data);
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
      return await api.recordings.updateNote({ recording_id, note_id, data });
    },
    onSuccess: (data) => {
      client.setQueryData(["recording", recording_id], data);
    },
  });

  const removeNote = useMutation({
    mutationFn: async (note_id: number) => {
      return await api.recordings.removeNote({
        recording_id,
        note_id,
      });
    },
    onSuccess: (data) => {
      return client.setQueryData(["recording", recording_id], data);
    },
  });

  const addFeature = useMutation({
    mutationFn: async (feature: Feature) => {
      return await api.recordings.addFeature({
        recording_id,
        feature_name_id: feature.feature_name.id,
        value: feature.value,
      });
    },
    onSuccess: (data, feature) => {
      client.setQueryData(["recording", recording_id], data);
      onAddFeature?.(feature);
    },
  });

  const removeFeature = useMutation({
    mutationFn: async (feature: Feature) => {
      return await api.recordings.removeFeature({
        recording_id,
        feature_name_id: feature.feature_name.id,
      });
    },
    onSuccess: (data, feature) => {
      client.setQueryData(["recording", recording_id], data);
      onRemoveFeature?.(feature);
    },
  });

  const updateFeature = useMutation({
    mutationFn: async (feature: Feature) => {
      return await api.recordings.updateFeature({
        recording_id,
        feature_name_id: feature.feature_name.id,
        value: feature.value,
      });
    },
    onSuccess: (data, feature) => {
      client.setQueryData(["recording", recording_id], data);
      onUpdateFeature?.(feature);
    },
  });

  const deleteRecording = useMutation({
    mutationFn: async () => {
      return await api.recordings.delete(recording_id);
    },
    onSuccess: () => {
      // Update the local cache
      client.invalidateQueries(["recording", recording_id]);
      onDelete?.();
    },
  });

  return {
    query,
    update,
    addTag,
    removeTag,
    addNote,
    removeNote,
    addFeature,
    updateNote,
    removeFeature,
    updateFeature,
    delete: deleteRecording,
  };
}
