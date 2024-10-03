import toast from "react-hot-toast";

import useNote from "@/app/hooks/api/useNote";

import NoteBase, { NoteProps } from "@/lib/components/notes/Note";

export default function Note(props: NoteProps) {
  const { note, onDeleteNote, onResolveNote, ...rest } = props;
  const {
    data,
    update,
    delete: deleteNote,
  } = useNote({
    uuid: note.uuid,
    note,
    onDelete: onDeleteNote,
    onUpdate: onResolveNote,
  });
  return (
    <NoteBase
      note={data || note}
      onDeleteNote={deleteNote.mutate}
      onResolveNote={() =>
        update.mutate(
          { is_issue: false },
          {
            onSuccess: () => toast.success("Issue resolved"),
          },
        )
      }
      {...rest}
    />
  );
}
