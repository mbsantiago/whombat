import { type AxiosError } from "axios";

import { type ClipAnnotation } from "@/api/schemas";
import api from "@/app/api";
import useObject from "@/hooks/utils/useObject";

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
  enabled = true,
}: {
  uuid: string;
  clipAnnotation?: ClipAnnotation;
  onDelete?: (annotation: ClipAnnotation) => void;
  onAddTag?: (annotation: ClipAnnotation) => void;
  onRemoveTag?: (annotation: ClipAnnotation) => void;
  onAddNote?: (annotation: ClipAnnotation) => void;
  onRemoveNote?: (annotation: ClipAnnotation) => void;
  onError?: (error: AxiosError) => void;
  enabled?: boolean;
}) {
  const { query, useMutation, useDestruction } = useObject<ClipAnnotation>({
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

  return {
    ...query,
    delete: delete_,
    addTag,
    removeTag,
    addNote,
    removeNote,
  } as const;
}
