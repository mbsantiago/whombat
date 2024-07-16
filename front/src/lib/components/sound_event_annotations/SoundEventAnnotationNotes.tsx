import { useMemo } from "react";

import Card from "@/lib/components/ui/Card";
import Empty from "@/lib/components/Empty";
import { H4 } from "@/lib/components/ui/Headings";
import { NotesIcon } from "@/lib/components/icons";
import CreateNote from "@/lib/components/notes/CreateNote";
import Feed from "@/lib/components/notes/Feed";

import type { NoteCreate } from "@/lib/api/notes";
import type { Note, SoundEventAnnotation, User } from "@/lib/types";

function NoNotes() {
  return <Empty padding="p-2">No notes</Empty>;
}

export default function SoundEventAnnotationNotes({
  soundEventAnnotation,
  currentUser,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
}: {
  soundEventAnnotation: SoundEventAnnotation;
  currentUser?: User;
  onCreateNote?: (note: NoteCreate) => void;
  onUpdateNote?: (note: Note) => void;
  onDeleteNote?: (note: Note) => void;
}) {
  const notes = useMemo(
    () => soundEventAnnotation.notes || [],
    [soundEventAnnotation],
  );

  return (
    <>
      <H4 className="text-center">
        <NotesIcon className="inline-block mr-1 w-5 h-5" />
        Sound Event Notes
      </H4>
      {onCreateNote != null && <CreateNote onCreate={onCreateNote} />}
      {notes.length === 0 ? (
        <NoNotes />
      ) : (
        <Feed
          notes={notes}
          currentUser={currentUser}
          onUpdate={onUpdateNote}
          onDelete={onDeleteNote}
        />
      )}
    </>
  );
}
