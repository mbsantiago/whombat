import Card from "@/lib/components/ui/Card";
import { H3 } from "@/lib/components/ui/Headings";
import { NotesIcon } from "@/lib/components/icons";
import CreateNote from "@/lib/components/notes/CreateNote";
import Feed from "@/lib/components/notes/Feed";

import type { NoteCreate } from "@/lib/api/notes";
import type { Note, User } from "@/lib/types";

function NoNotes() {
  return (
    <div className="p-4 w-full">
      <div className="flex flex-col justify-center items-center p-8 w-full rounded-lg border border-dashed border-stone-500 bg-stone-300 dark:bg-stone-800">
        <span className="text-stone-700 dark:text-stone-300">
          <NotesIcon className="inline-block mr-1 w-5 h-5" /> No notes
        </span>
        <span className="text-sm text-stone-500">
          Create a note above to start a conversation about this recording.
        </span>
      </div>
    </div>
  );
}

export default function RecordingNotes({
  notes,
  currentUser,
  onNoteCreate,
  onNoteUpdate,
  onNoteDelete,
}: {
  notes: Note[];
  currentUser?: User;
  onNoteCreate?: (note: NoteCreate) => void;
  onNoteUpdate?: (note: Note, data: Partial<Note>) => void;
  onNoteDelete?: (note: Note) => void;
}) {
  return (
    <Card>
      <H3>
        <NotesIcon className="inline-block mr-1 w-5 h-5" />
        Notes
      </H3>
      {notes.length === 0 ? (
        <NoNotes />
      ) : (
        <Feed
          notes={notes}
          currentUser={currentUser}
          onUpdate={onNoteUpdate}
          onDelete={onNoteDelete}
        />
      )}
      <CreateNote onCreate={onNoteCreate} />
    </Card>
  );
}
