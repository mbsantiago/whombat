import { useCallback, useMemo } from "react";

import Card from "@/components/Card";
import { H3 } from "@/components/Headings";
import { NotesIcon } from "@/components/icons";
import CreateNote from "@/components/notes/CreateNote";
import Feed from "@/components/notes/Feed";
import useRecording from "@/hooks/api/useRecording";

import type { Note, Recording, User } from "@/types";

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
  recording: data,
  currentUser,
}: {
  recording: Recording;
  currentUser?: User;
}) {
  const {
    data: recording,
    addNote,
    set,
  } = useRecording({
    uuid: data.uuid,
    recording: data,
    enabled: false,
  });

  const onUpdate = useCallback(
    (note: Note) => {
      if (recording == null) return;
      set({
        ...recording,
        notes: recording.notes?.map((n) => {
          if (n.uuid === note.uuid) {
            return note;
          }
          return n;
        }),
      });
    },
    [recording, set],
  );

  const onDelete = useCallback(
    (note: Note) => {
      if (recording == null) return;
      set({
        ...recording,
        notes: recording.notes?.filter((n) => n.uuid !== note.uuid),
      });
    },
    [recording, set],
  );

  const notes = useMemo(() => {
    return data.notes || [];
  }, [data.notes]);

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
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      )}
      <CreateNote onCreate={addNote.mutate} />
    </Card>
  );
}
