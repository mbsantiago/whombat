import api from "@/app/api";

import useObject from "@/lib/hooks/utils/useObject";

import type { Note } from "@/lib/types";

export default function useNote({
  uuid,
  note,
  onUpdate,
  onDelete,
  enabled = true,
}: {
  uuid: string;
  note?: Note;
  onUpdate?: (note: Note) => void;
  onDelete?: (note: Note) => void;
  enabled?: boolean;
}) {
  if (note !== undefined && note.uuid !== uuid) {
    throw new Error("Note uuid does not match");
  }

  const { query, useMutation, useDestruction } = useObject({
    id: uuid,
    initialData: note,
    name: "note",
    enabled,
    queryFn: api.notes.get,
  });

  const update = useMutation({
    mutationFn: api.notes.update,
    onSuccess: onUpdate,
  });

  const delete_ = useDestruction({
    mutationFn: api.notes.delete,
    onSuccess: onDelete,
  });

  return {
    ...query,
    update,
    delete: delete_,
  } as const;
}
