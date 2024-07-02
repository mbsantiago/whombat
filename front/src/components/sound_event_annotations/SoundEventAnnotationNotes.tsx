import { useMemo } from "react";

import Card from "@/components/Card";
import Empty from "@/components/Empty";
import { H4 } from "@/components/Headings";
import { NotesIcon } from "@/components/icons";
import CreateNote from "@/components/notes/CreateNote";
import Feed from "@/components/notes/Feed";

import type { NoteCreate } from "@/lib/api/notes";
import type { Note, SoundEventAnnotation, User } from "@/types";

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
