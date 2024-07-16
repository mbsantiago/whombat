import { type AxiosError } from "axios";
import { useMemo } from "react";
import toast from "react-hot-toast";

import api from "@/app/api";
import useObject from "@/lib/hooks/utils/useObject";
import { useMutation as useReactQueryMutation } from "@tanstack/react-query";

import type { NoteUpdate, NoteCreate } from "@/lib/api/notes";
import type { RecordingUpdate } from "@/lib/api/recordings";
import type { Recording, Tag, Note, Feature } from "@/lib/types";

export default function useRecording({
  uuid,
  enabled = true,
  onUpdate,
  onDelete,
  onAddTag,
  onRemoveTag,
  onAddNote,
  onUpdateNote,
  onRemoveNote,
  onAddFeature,
  onRemoveFeature,
  onUpdateFeature,
  onError,
}: {
  uuid: string;
  enabled?: boolean;
  onUpdate?: (recording: RecordingUpdate) => void;
  onDelete?: (recording: Recording) => void;
  onAddTag?: (recording: Recording, tag: Tag) => void;
  onRemoveTag?: (recording: Recording, tag: Tag) => void;
  onAddNote?: (recording: Recording, note: NoteCreate) => void;
  onUpdateNote?: (recording: Recording, note: Note) => void;
  onRemoveNote?: (recording: Recording, note: NoteUpdate) => void;
  onAddFeature?: (recording: Recording, feature: Feature) => void;
  onRemoveFeature?: (recording: Recording, feature: Feature) => void;
  onUpdateFeature?: (recording: Recording, feature: Feature) => void;
  onError?: (error: AxiosError) => void;
}) {
  const { query, useMutation, useDestruction } = useObject({
    id: uuid,
    name: "recording",
    queryFn: api.recordings.get,
    enabled,
    onError,
  });

  const { mutate: updateRecording } = useMutation({
    mutationFn: api.recordings.update,
    onError,
    onSuccess: (data) => {
      toast.success("Recording updated");
      onUpdate?.(data);
    },
  });

  const { mutate: deleteRecording } = useDestruction({
    mutationFn: api.recordings.delete,
    onSuccess: (data) => {
      toast.success("Recording deleted");
      onDelete?.(data);
    },
  });

  const { mutate: addTag } = useMutation({
    mutationFn: api.recordings.addTag,
    onSuccess: (recording, tag) => {
      toast.success(`Tag ${tag.key}:${tag.value} added`);
      onAddTag?.(recording, tag);
    },
  });

  const { mutate: removeTag } = useMutation({
    mutationFn: api.recordings.removeTag,
    onSuccess: (recording, tag) => {
      toast.success(`Tag ${tag.key}:${tag.value} removed`);
      onRemoveTag?.(recording, tag);
    },
  });

  const { mutate: addNote } = useMutation({
    mutationFn: api.recordings.addNote,
    onSuccess: (recording, note) => {
      toast.success("Note added");
      const n = recording.notes!.find((n) => n.message === note.message);
      onAddNote?.(recording, n!);
    },
  });

  const { mutate: updateNote } = useReactQueryMutation({
    mutationFn: ({ note, data }: { note: Note; data: NoteUpdate }) =>
      api.notes.update(note, data),
    onSuccess: (note) => {
      toast.success("Note updated");
      query.refetch();
      onUpdateNote?.(query.data!, note);
    },
  });

  const { mutate: removeNote } = useMutation({
    mutationFn: api.recordings.removeNote,
    onSuccess: (recording, note) => {
      toast.success("Note removed");
      onRemoveNote?.(recording, note);
    },
  });

  const { mutate: addFeature } = useMutation({
    mutationFn: api.recordings.addFeature,
    onSuccess: (recording, feature) => {
      toast.success("Feature added");
      onAddFeature?.(recording, feature);
    },
  });

  const { mutate: removeFeature } = useMutation({
    mutationFn: api.recordings.removeFeature,
    onSuccess: (recording, feature) => {
      toast.success("Feature removed");
      onRemoveFeature?.(recording, feature);
    },
  });

  const { mutate: updateFeature } = useMutation({
    mutationFn: api.recordings.updateFeature,
    onSuccess: (recording, feature) => {
      toast.success("Feature updated");
      onUpdateFeature?.(recording, feature);
    },
  });

  const { data, isLoading, isError, isSuccess, error } = query;

  const downloadUrl = useMemo(() => {
    if (data == null) return undefined;
    return api.audio.getDownloadUrl({ recording: data });
  }, [data]);

  return {
    data,
    isLoading,
    isError,
    isSuccess,
    error,
    updateRecording,
    deleteRecording,
    addTag,
    removeTag,
    addNote,
    updateNote,
    removeNote,
    addFeature,
    removeFeature,
    updateFeature,
    downloadUrl,
  };
}
