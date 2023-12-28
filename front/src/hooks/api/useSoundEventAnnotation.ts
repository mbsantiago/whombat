import { type AxiosError } from "axios";

import { type SoundEventAnnotation } from "@/api/schemas";
import api from "@/app/api";
import useObject from "@/hooks/utils/useObject";

/**
 * A hook for managing the state of a sound event annotation.
 */
export default function useSoundEventAnnotation({
  uuid,
  soundEventAnnotation,
  onDelete,
  onUpdate,
  onAddTag,
  onRemoveTag,
  onAddNote,
  onError,
  enabled = true,
}: {
  uuid: string;
  soundEventAnnotation?: SoundEventAnnotation;
  onDelete?: (annotation: SoundEventAnnotation) => void;
  onUpdate?: (annotation: SoundEventAnnotation) => void;
  onAddTag?: (annotation: SoundEventAnnotation) => void;
  onRemoveTag?: (annotation: SoundEventAnnotation) => void;
  onAddNote?: (annotation: SoundEventAnnotation) => void;
  onError?: (error: AxiosError) => void;
  enabled?: boolean;
}) {
  const { query, useMutation, useDestruction } =
    useObject<SoundEventAnnotation>({
      name: "sound_event_annotation",
      uuid,
      initial: soundEventAnnotation,
      enabled,
      getFn: api.soundEventAnnotations.get,
      onError,
    });

  const update = useMutation({
    mutationFn: api.soundEventAnnotations.update,
    onSuccess: onUpdate,
  });

  const delete_ = useDestruction({
    mutationFn: api.soundEventAnnotations.delete,
    onSuccess: onDelete,
  });

  const addTag = useMutation({
    mutationFn: api.soundEventAnnotations.addTag,
    onSuccess: onAddTag,
  });

  const removeTag = useMutation({
    mutationFn: api.soundEventAnnotations.removeTag,
    onSuccess: onRemoveTag,
  });

  const addNote = useMutation({
    mutationFn: api.soundEventAnnotations.addNote,
    onSuccess: onAddNote,
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
