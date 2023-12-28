import { useMemo } from "react";
import type { ClipAnnotation, Note, User } from "@/api/schemas";
import { type NoteCreate } from "@/api/notes";
import Card from "@/components/Card";
import { H4 } from "@/components/Headings";
import { NotesIcon } from "@/components/icons";
import Feed from "@/components/notes/Feed";
import Empty from "@/components/Empty";
import CreateNote from "@/components/notes/CreateNote";

function NoNotes() {
  return <Empty>No notes</Empty>;
}

export default function ClipAnnotationNotes({
  clipAnnotation,
  currentUser,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
}: {
  clipAnnotation: ClipAnnotation;
  currentUser?: User;
  onCreateNote?: (note: NoteCreate) => void;
  onUpdateNote?: (note: Note) => void;
  onDeleteNote?: (note: Note) => void;
}) {
  const notes = useMemo(() => clipAnnotation.notes || [], [clipAnnotation]);

  return (
    <Card>
      <H4 className="text-center">
        <NotesIcon className="inline-block mr-1 w-5 h-5" />
        Clip Notes
      </H4>
      <CreateNote onCreate={onCreateNote} />
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
    </Card>
  );
}
