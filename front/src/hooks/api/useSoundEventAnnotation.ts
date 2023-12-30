import { useCallback } from "react";

import api from "@/app/api";
import useObject from "@/hooks/utils/useObject";

import type { ClipAnnotation, SoundEventAnnotation } from "@/types";
import type { AxiosError } from "axios";

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
}: {
  uuid: string;
  clipAnnotation?: ClipAnnotation;
  soundEventAnnotation?: SoundEventAnnotation;
  onDelete?: (annotation: SoundEventAnnotation) => void;
  onUpdate?: (annotation: SoundEventAnnotation) => void;
  onAddTag?: (annotation: SoundEventAnnotation) => void;
  onRemoveTag?: (annotation: SoundEventAnnotation) => void;
  onAddNote?: (annotation: SoundEventAnnotation) => void;
  onError?: (error: AxiosError) => void;
  enabled?: boolean;
}) {
  const { query, useMutation, useDestruction, client } =
    useObject<SoundEventAnnotation>({
      name: "sound_event_annotation",
      uuid,
      initial: soundEventAnnotation,
      enabled,
      getFn: api.soundEventAnnotations.get,
      onError,
    });

  const updateClipAnnotation = useCallback(
    (annotation: SoundEventAnnotation) => {
      if (clipAnnotation == null) return;

      // Update the clip annotation in the cache.
      client.setQueryData(["clip_annotation", clipAnnotation.uuid], (data) => {
        if (data == null) return;
        return {
          ...data,
          sound_events: data.sound_events.map((a) =>
            a.uuid === annotation.uuid ? annotation : a,
          ),
        };
      });
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
    (annotation: SoundEventAnnotation) => {
      onAddTag?.(annotation);
      updateClipAnnotation(annotation);
    },
    [onAddTag, updateClipAnnotation],
  );

  const addTag = useMutation({
    mutationFn: api.soundEventAnnotations.addTag,
    onSuccess: handleAddTag,
  });

  const handleRemoveTag = useCallback(
    (annotation: SoundEventAnnotation) => {
      onRemoveTag?.(annotation);
      updateClipAnnotation(annotation);
    },
    [onRemoveTag, updateClipAnnotation],
  );

  const removeTag = useMutation({
    mutationFn: api.soundEventAnnotations.removeTag,
    onSuccess: handleRemoveTag,
  });

  const handleAddNote = useCallback(
    (annotation: SoundEventAnnotation) => {
      onAddNote?.(annotation);
      updateClipAnnotation(annotation);
    },
    [onAddNote, updateClipAnnotation],
  );

  const addNote = useMutation({
    mutationFn: api.soundEventAnnotations.addNote,
    onSuccess: handleAddNote,
  });

  return {
    ...query,
    update,
    delete: delete_,
    addTag,
    removeTag,
    addNote,
  } as const;
}
