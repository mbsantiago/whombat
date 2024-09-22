import { useMutation as useQueryMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import api from "@/app/api";

import useObject from "@/lib/hooks/utils/useObject";

import type {
  ClipAnnotation,
  Geometry,
  Note,
  NoteCreate,
  NoteUpdate,
  SoundEventAnnotation,
  Tag,
} from "@/lib/types";

/**
 * A hook for managing the state of a clip annotation.
 */
export default function useClipAnnotation({
  uuid,
  clipAnnotation,
  onError,
  onDeleteClipAnnotation,
  onAddClipAnnotationTag,
  onRemoveClipAnnotationTag,
  onAddClipAnnotationNote,
  onUpdateClipAnnotationNote,
  onRemoveClipAnnotationNote,
  onAddSoundEventAnnotation,
  onDeleteSoundEventAnnotation,
  onUpdateSoundEventAnnotation,
  onAddTagToSoundEventAnnotation,
  onRemoveTagFromSoundEventAnnotation,
  enabled = true,
}: {
  uuid: string;
  clipAnnotation?: ClipAnnotation;
  onDeleteClipAnnotation?: (annotation: ClipAnnotation) => void;
  onAddClipAnnotationTag?: (annotation: ClipAnnotation, tag: Tag) => void;
  onRemoveClipAnnotationTag?: (annotation: ClipAnnotation, tag: Tag) => void;
  onAddClipAnnotationNote?: (
    annotation: ClipAnnotation,
    note: NoteCreate,
  ) => void;
  onUpdateClipAnnotationNote?: (
    annotation: ClipAnnotation,
    note: NoteUpdate,
  ) => void;
  onRemoveClipAnnotationNote?: (annotation: ClipAnnotation, note: Note) => void;
  onAddSoundEventAnnotation?: (annotation: SoundEventAnnotation) => void;
  onDeleteSoundEventAnnotation?: (annotation: SoundEventAnnotation) => void;
  onUpdateSoundEventAnnotation?: (annotation: SoundEventAnnotation) => void;
  onAddTagToSoundEventAnnotation?: (annotation: SoundEventAnnotation) => void;
  onRemoveTagFromSoundEventAnnotation?: (
    annotation: SoundEventAnnotation,
  ) => void;
  onError?: (error: AxiosError) => void;
  enabled?: boolean;
}) {
  if (clipAnnotation != null && clipAnnotation.uuid !== uuid) {
    throw new Error("Clip annotation UUID does not match the provided UUID.");
  }

  const { query, useMutation, useDestruction, setData, client } =
    useObject<ClipAnnotation>({
      name: "clip_annotation",
      id: uuid,
      initialData: clipAnnotation,
      enabled,
      queryFn: api.clipAnnotations.get,
      onError,
    });

  const deleteClipAnnotation = useDestruction({
    mutationFn: api.clipAnnotations.delete,
    onSuccess: onDeleteClipAnnotation,
  });

  const addClipAnnotationTag = useMutation({
    mutationFn: api.clipAnnotations.addTag,
    onSuccess: onAddClipAnnotationTag,
  });

  const removeClipAnnotationTag = useMutation({
    mutationFn: api.clipAnnotations.removeTag,
    onSuccess: onRemoveClipAnnotationTag,
  });

  const addClipAnnotationNote = useMutation({
    mutationFn: api.clipAnnotations.addNote,
    onSuccess: onAddClipAnnotationNote,
  });

  const updateClipAnnotationNote = useQueryMutation({
    mutationFn: ({ note, data }: { note: Note; data: NoteUpdate }) =>
      api.notes.update(note, data),
    onSuccess: (note) => {
      query.refetch();
      onUpdateClipAnnotationNote?.(query.data!, note);
    },
  });

  const removeClipAnnotationNote = useMutation({
    mutationFn: api.clipAnnotations.removeNote,
    onSuccess: onRemoveClipAnnotationNote,
  });

  const addSoundEvent = useQueryMutation<
    SoundEventAnnotation,
    AxiosError,
    {
      geometry: Geometry;
      tags: Tag[];
    }
  >({
    mutationFn: ({ geometry, tags }) => {
      if (query.data == null) throw new Error("No clip annotation to add to.");
      return api.soundEventAnnotations.create(query.data, {
        geometry,
        tags,
      });
    },
    onSuccess: (data) => {
      onAddSoundEventAnnotation?.(data);
      setData((prev) => {
        if (prev == null) throw new Error("No clip annotation to add to.");
        return {
          ...prev,
          sound_events: [...(prev.sound_events || []), data],
        };
      });
    },
  });

  const updateSoundEvent = useQueryMutation<
    SoundEventAnnotation,
    AxiosError,
    {
      soundEventAnnotation: SoundEventAnnotation;
      geometry: Geometry;
    }
  >({
    mutationFn: ({ soundEventAnnotation, geometry }) => {
      return api.soundEventAnnotations.update(soundEventAnnotation, {
        geometry,
      });
    },
    onSuccess: (data) => {
      client.setQueryData(["sound_event_annotation", data.uuid], data);
      onUpdateSoundEventAnnotation?.(data);
      setData((prev) => {
        if (prev == null) throw new Error("No clip annotation to add to.");
        return {
          ...prev,
          sound_events: (prev.sound_events || []).map((soundEvent) =>
            soundEvent.uuid === data.uuid ? data : soundEvent,
          ),
        };
      });
    },
  });

  const removeSoundEvent = useQueryMutation<
    SoundEventAnnotation,
    AxiosError,
    SoundEventAnnotation
  >({
    mutationFn: (soundEventAnnotation) => {
      return api.soundEventAnnotations.delete(soundEventAnnotation);
    },
    onSuccess: (data) => {
      onDeleteSoundEventAnnotation?.(data);
      setData((prev) => {
        if (prev == null) throw new Error("No clip annotation to add to.");
        return {
          ...prev,
          sound_events: (prev.sound_events || []).filter(
            (soundEvent) => soundEvent.uuid !== data.uuid,
          ),
        };
      });
    },
  });

  const addSoundEventTag = useQueryMutation<
    SoundEventAnnotation,
    AxiosError,
    {
      soundEventAnnotation: SoundEventAnnotation;
      tag: Tag;
    }
  >({
    mutationFn: ({ soundEventAnnotation, tag }) => {
      return api.soundEventAnnotations.addTag(soundEventAnnotation, tag);
    },
    onSuccess: (data) => {
      onAddTagToSoundEventAnnotation?.(data);
      setData((prev) => {
        if (prev == null) throw new Error("No clip annotation to add to.");
        return {
          ...prev,
          sound_events: (prev.sound_events || []).map((soundEvent) =>
            soundEvent.uuid === data.uuid ? data : soundEvent,
          ),
        };
      });
    },
  });

  const removeSoundEventTag = useQueryMutation<
    SoundEventAnnotation,
    AxiosError,
    {
      soundEventAnnotation: SoundEventAnnotation;
      tag: Tag;
    }
  >({
    mutationFn: ({ soundEventAnnotation, tag }) => {
      return api.soundEventAnnotations.removeTag(soundEventAnnotation, tag);
    },
    onSuccess: (data) => {
      onRemoveTagFromSoundEventAnnotation?.(data);
      setData((prev) => {
        if (prev == null) throw new Error("No clip annotation to add to.");
        return {
          ...prev,
          sound_events: (prev.sound_events || []).map((soundEvent) =>
            soundEvent.uuid === data.uuid ? data : soundEvent,
          ),
        };
      });
    },
  });

  return {
    ...query,
    deleteClipAnnotation,
    addClipAnnotationTag,
    removeClipAnnotationTag,
    addClipAnnotationNote,
    updateClipAnnotationNote,
    removeClipAnnotationNote,
    addSoundEvent,
    updateSoundEvent,
    removeSoundEvent,
    addSoundEventTag,
    removeSoundEventTag,
  } as const;
}
