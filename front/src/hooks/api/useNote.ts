import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type NoteUpdate } from "@/api/notes";
import { type Note } from "@/api/schemas";
import api from "@/app/api";

export default function useNote({
  note,
  onUpdate,
  onDelete,
  enabled = true,
}: {
  note: Note;
  onUpdate?: (note: Note) => void;
  onDelete?: (note: Note) => void;
  enabled?: boolean;
}) {
  const client = useQueryClient();

  const query = useQuery(
    ["note", note.uuid],
    async () => await api.notes.get(note.uuid),
    {
      initialData: note,
      staleTime: 1000 * 60 * 5,
      enabled,
    },
  );

  const update = useMutation(
    async (data: NoteUpdate) => await api.notes.update(note, data),
    {
      onSuccess: (note) => {
        client.setQueryData(["note", note.uuid], note);
        onUpdate?.(note);
      },
    },
  );

  const delete_ = useMutation(async () => await api.notes.delete(note), {
    onSuccess: () => {
      query.remove();
      onDelete?.(note);
    },
  });

  return {
    ...query,
    update,
    delete: delete_,
  } as const;
}
