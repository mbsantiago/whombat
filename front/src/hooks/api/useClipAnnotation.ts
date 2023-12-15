import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/app/api";
import { type NoteCreate } from "@/api/notes";
import { type ClipAnnotation, type Tag } from "@/api/schemas";

/**
 * A hook for managing the state of a clip annotation.
 */
export default function useClipAnnotation({
  clipAnnotation,
  onDelete,
  onAddTag,
  onRemoveTag,
  onAddNote,
  enabled = true,
}: {
  clipAnnotation: ClipAnnotation;
  onDelete?: (annotation: ClipAnnotation) => void;
  onAddTag?: (annotation: ClipAnnotation) => void;
  onRemoveTag?: (annotation: ClipAnnotation) => void;
  onAddNote?: (annotation: ClipAnnotation) => void;
  enabled?: boolean;
}) {
  const client = useQueryClient();

  const query = useQuery(
    ["clip_annotation", clipAnnotation.uuid],
    async () => await api.clipAnnotations.get(clipAnnotation.uuid),
    {
      initialData: clipAnnotation,
      staleTime: 1000 * 60 * 5,
      enabled,
    },
  );

  const delete_ = useMutation({
    mutationFn: () => {
      return api.clipAnnotations.delete(clipAnnotation);
    },
    onSuccess: (data, _) => {
      query.remove();
      onDelete?.(data);
    },
  });

  const addTag = useMutation({
    mutationFn: (tag: Tag) => {
      return api.clipAnnotations.addTag(clipAnnotation, tag);
    },
    onSuccess: (data) => {
      client.setQueryData(["clip_annotation", clipAnnotation.uuid], data);
      onAddTag?.(data);
    },
  });

  const removeTag = useMutation({
    mutationFn: (tag: Tag) => {
      return api.clipAnnotations.removeTag(clipAnnotation, tag);
    },
    onSuccess: (data) => {
      client.setQueryData(["clip_annotation", clipAnnotation.uuid], data);
      onRemoveTag?.(data);
    },
  });

  const addNote = useMutation({
    mutationFn: (data: NoteCreate) => {
      return api.clipAnnotations.addNote(clipAnnotation, data);
    },
    onSuccess: (data) => {
      client.setQueryData(["clip_annotation", clipAnnotation.uuid], data);
      onAddNote?.(data);
    },
  });

  return {
    ...query,
    delete: delete_,
    addTag,
    removeTag,
    addNote,
  } as const;
}
