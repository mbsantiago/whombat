import { NotesIcon } from "@/lib/components/icons";
import CreateNote from "@/lib/components/notes/CreateNote";
import Feed from "@/lib/components/notes/Feed";
import Card from "@/lib/components/ui/Card";
import { H3 } from "@/lib/components/ui/Headings";

import type { Note, NoteCreate, NoteUpdate, User } from "@/lib/types";

export default function NotesPanel({
  notes,
  title = "Notes",
  currentUser,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  EmptyNotes = <NoNotes />,
}: {
  title?: string;
  notes: Note[];
  currentUser?: User;
  onCreateNote?: (note: NoteCreate) => void;
  onUpdateNote?: (note: Note, data: NoteUpdate) => void;
  onDeleteNote?: (note: Note) => void;
  EmptyNotes?: JSX.Element;
}) {
  return (
    <Card>
      <H3>
        <NotesIcon className="inline-block mr-1 w-5 h-5" />
        {title}
      </H3>
      {notes.length === 0 ? (
        EmptyNotes
      ) : (
        <Feed
          notes={notes}
          currentUser={currentUser}
          onUpdate={onUpdateNote}
          onDelete={onDeleteNote}
        />
      )}
      <CreateNote onCreateNote={onCreateNote} />
    </Card>
  );
}

function NoNotes() {
  return (
    <div className="p-4 w-full">
      <div className="flex flex-col justify-center items-center p-8 w-full rounded-lg border border-dashed border-stone-500 bg-stone-300 dark:bg-stone-800">
        <span className="text-stone-700 dark:text-stone-300">
          <NotesIcon className="inline-block mr-1 w-5 h-5" /> No notes
        </span>
        <span className="text-sm text-stone-500">
          Create a note above to start a conversation.
        </span>
      </div>
    </div>
  );
}
