import { useMutation as useQueryMutation } from "@tanstack/react-query";

import api from "@/app/api";
import useObject from "@/hooks/utils/useObject";

import type {
  ClipAnnotation,
  Geometry,
  SoundEventAnnotation,
  Tag,
} from "@/types";
import type { AxiosError } from "axios";

/**
 * A hook for managing the state of a clip annotation.
 */
export default function useClipAnnotation({
  uuid,
  clipAnnotation,
  onDelete,
  onAddTag,
  onRemoveTag,
  onAddNote,
  onRemoveNote,
  onError,
  onAddSoundEventAnnotation,
  onDeleteSoundEventAnnotation,
  onUpdateSoundEventAnnotation,
  onAddTagToSoundEventAnnotation,
  onRemoveTagFromSoundEventAnnotation,
  enabled = true,
}: {
  uuid: string;
  clipAnnotation?: ClipAnnotation;
  onDelete?: (annotation: ClipAnnotation) => void;
  onAddTag?: (annotation: ClipAnnotation) => void;
  onRemoveTag?: (annotation: ClipAnnotation) => void;
  onAddNote?: (annotation: ClipAnnotation) => void;
  onRemoveNote?: (annotation: ClipAnnotation) => void;
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
  const { query, useMutation, useDestruction, setData } =
    useObject<ClipAnnotation>({
      name: "clip_annotation",
      uuid,
      initial: clipAnnotation,
      enabled,
      getFn: api.clipAnnotations.get,
      onError,
    });

  const delete_ = useDestruction({
    mutationFn: api.clipAnnotations.delete,
    onSuccess: onDelete,
  });

  const addTag = useMutation({
    mutationFn: api.clipAnnotations.addTag,
    onSuccess: onAddTag,
  });

  const removeTag = useMutation({
    mutationFn: api.clipAnnotations.removeTag,
    onSuccess: onRemoveTag,
  });

  const addNote = useMutation({
    mutationFn: api.clipAnnotations.addNote,
    onSuccess: onAddNote,
  });

  const removeNote = useMutation({
    mutationFn: api.clipAnnotations.removeNote,
    onSuccess: onRemoveNote,
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

  const addTagToSoundEvent = useQueryMutation<
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

  const removeTagFromSoundEvent = useQueryMutation<
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
    delete: delete_,
    addTag,
    removeTag,
    addNote,
    removeNote,
    addSoundEvent,
    updateSoundEvent,
    removeSoundEvent,
    addTagToSoundEvent,
    removeTagFromSoundEvent,
  } as const;
}
