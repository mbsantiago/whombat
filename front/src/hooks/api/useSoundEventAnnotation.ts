import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/app/api";
import { type NoteCreate } from "@/api/notes";
import { type SoundEventAnnotation, type Tag } from "@/api/schemas";
import { type SoundEventAnnotationUpdate } from "@/api/sound_event_annotations";

/**
 * A hook for managing the state of a sound event annotation.
 */
export default function useSoundEventAnnotation({
  soundEventAnnotation,
  onDelete,
  onUpdate,
  onAddTag,
  onRemoveTag,
  onAddNote,
  enabled = true,
}: {
  soundEventAnnotation: SoundEventAnnotation;
  onDelete?: (annotation: SoundEventAnnotation) => void;
  onUpdate?: (annotation: SoundEventAnnotation) => void;
  onAddTag?: (annotation: SoundEventAnnotation) => void;
  onRemoveTag?: (annotation: SoundEventAnnotation) => void;
  onAddNote?: (annotation: SoundEventAnnotation) => void;
  enabled?: boolean;
}) {
  const client = useQueryClient();

  const query = useQuery(
    ["sound_event_annotation", soundEventAnnotation.uuid],
    async () => await api.soundEventAnnotations.get(soundEventAnnotation.uuid),
    {
      initialData: soundEventAnnotation,
      staleTime: 1000 * 60 * 5,
      enabled,
    },
  );

  const update = useMutation({
    mutationFn: ({
      soundEventAnnotation,
      data,
    }: {
      soundEventAnnotation: SoundEventAnnotation;
      data: SoundEventAnnotationUpdate;
    }) => {
      return api.soundEventAnnotations.update(soundEventAnnotation, data);
    },
    onSuccess: (data, _) => {
      client.setQueryData(
        ["sound_event_annotation", soundEventAnnotation.uuid],
        data,
      );
      onUpdate?.(data);
    },
  });

  const delete_ = useMutation({
    mutationFn: (soundEventAnnotation: SoundEventAnnotation) => {
      return api.soundEventAnnotations.delete(soundEventAnnotation);
    },
    onSuccess: (data, _) => {
      query.remove();
      onDelete?.(data);
    },
  });

  const addTag = useMutation({
    mutationFn: (tag: Tag) => {
      return api.soundEventAnnotations.addTag(soundEventAnnotation, tag);
    },
    onSuccess: (data) => {
      client.setQueryData(
        ["sound_event_annotation", soundEventAnnotation.uuid],
        data,
      );
      onAddTag?.(data);
    },
  });

  const removeTag = useMutation({
    mutationFn: (tag: Tag) => {
      return api.soundEventAnnotations.removeTag(soundEventAnnotation, tag);
    },
    onSuccess: (data) => {
      client.setQueryData(
        ["sound_event_annotation", soundEventAnnotation.uuid],
        data,
      );
      onRemoveTag?.(data);
    },
  });

  const addNote = useMutation({
    mutationFn: (data: NoteCreate) => {
      return api.soundEventAnnotations.addNote(soundEventAnnotation, data);
    },
    onSuccess: (data) => {
      client.setQueryData(
        ["sound_event_annotation", soundEventAnnotation.uuid],
        data,
      );
      onAddNote?.(data);
    },
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
