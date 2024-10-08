import {
  useMutation as useReactMutation,
  useQuery as useReactQuery,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useCallback, useMemo } from "react";

import api from "@/app/api";

import useObject from "@/lib/hooks/utils/useObject";

import type {
  ClipAnnotation,
  Note,
  NoteCreate,
  NoteUpdate,
  Recording,
  SoundEventAnnotation,
  Tag,
} from "@/lib/types";

/**
 * A hook for managing the state of a sound event annotation.
 */
export default function useSoundEventAnnotation({
  uuid,
  soundEventAnnotation,
  clipAnnotation,
  onDelete,
  onUpdate,
  onAddTag,
  onRemoveTag,
  onAddNote,
  onError,
  enabled = true,
  withRecording = false,
}: {
  uuid: string;
  clipAnnotation?: ClipAnnotation;
  soundEventAnnotation?: SoundEventAnnotation;
  onDelete?: (annotation: SoundEventAnnotation) => void;
  onUpdate?: (annotation: SoundEventAnnotation) => void;
  onAddTag?: (tag: Tag) => void;
  onRemoveTag?: (tag: Tag) => void;
  onAddNote?: (note: NoteCreate) => void;
  onError?: (error: AxiosError) => void;
  enabled?: boolean;
  withRecording?: boolean;
}) {
  const { query, useQuery, useMutation, useDestruction, client } =
    useObject<SoundEventAnnotation>({
      name: "sound_event_annotation",
      id: uuid,
      initialData: soundEventAnnotation,
      enabled,
      queryFn: api.soundEventAnnotations.get,
      onError,
    });

  const getRecordingFn = useMemo(() => {
    if (!withRecording)
      return () => {
        throw new Error(
          "Cannot get recording for sound event annotation without recording",
        );
      };

    return () => {
      if (query.data == null) {
        throw new Error(
          "Cannot get recording for sound event annotation without recording",
        );
      }
      return api.soundEvents.getRecording(query.data.sound_event);
    };
  }, [query.data, withRecording]);

  const recordingQuery = useQuery<Recording>({
    secondaryName: "recording",
    queryFn: getRecordingFn,
    enabled: withRecording && query.data != null,
  }) as ReturnType<typeof useReactQuery<Recording>>;

  const updateClipAnnotation = useCallback(
    (annotation: SoundEventAnnotation) => {
      if (clipAnnotation == null) return;

      // Update the clip annotation in the cache.
      client.setQueryData(
        ["clip_annotation", clipAnnotation.uuid],
        (data: ClipAnnotation) => {
          if (data == null) return;
          return {
            ...data,
            sound_events: data.sound_events?.map((a) =>
              a.uuid === annotation.uuid ? annotation : a,
            ),
          };
        },
      );
    },
    [client, clipAnnotation],
  );

  const handleUpdate = useCallback(
    (annotation: SoundEventAnnotation) => {
      onUpdate?.(annotation);
      updateClipAnnotation(annotation);
    },
    [onUpdate, updateClipAnnotation],
  );

  const update = useMutation({
    mutationFn: api.soundEventAnnotations.update,
    onSuccess: handleUpdate,
  });

  const handleDelete = useCallback(
    (annotation: SoundEventAnnotation) => {
      onDelete?.(annotation);
      updateClipAnnotation(annotation);
    },
    [onDelete, updateClipAnnotation],
  );

  const delete_ = useDestruction({
    mutationFn: api.soundEventAnnotations.delete,
    onSuccess: handleDelete,
  });

  const handleAddTag = useCallback(
    (annotation: SoundEventAnnotation, tag: Tag) => {
      onAddTag?.(tag);
      updateClipAnnotation(annotation);
    },
    [onAddTag, updateClipAnnotation],
  );

  const addTag = useMutation({
    mutationFn: api.soundEventAnnotations.addTag,
    onSuccess: handleAddTag,
  });

  const handleRemoveTag = useCallback(
    (annotation: SoundEventAnnotation, tag: Tag) => {
      onRemoveTag?.(tag);
      updateClipAnnotation(annotation);
    },
    [onRemoveTag, updateClipAnnotation],
  );

  const removeTag = useMutation({
    mutationFn: api.soundEventAnnotations.removeTag,
    onSuccess: handleRemoveTag,
  });

  const handleAddNote = useCallback(
    (annotation: SoundEventAnnotation, note: NoteCreate) => {
      onAddNote?.(note);
      updateClipAnnotation(annotation);
    },
    [onAddNote, updateClipAnnotation],
  );

  const addNote = useMutation({
    mutationFn: api.soundEventAnnotations.addNote,
    onSuccess: handleAddNote,
  });

  const updateNote = useReactMutation({
    mutationFn: ({ note, data }: { note: Note; data: NoteUpdate }) =>
      api.notes.update(note, data),
    onSuccess: () => {
      query.refetch();
    },
  });

  const removeNote = useMutation({
    mutationFn: api.soundEventAnnotations.removeNote,
  });

  return {
    ...query,
    update,
    delete: delete_,
    addTag,
    removeTag,
    addNote,
    updateNote,
    removeNote,
    recording: recordingQuery,
  } as const;
}
