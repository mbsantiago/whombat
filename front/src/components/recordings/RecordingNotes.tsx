import { useState, useMemo, useCallback } from "react";

import Card from "@/components/Card";
import { H3 } from "@/components/Headings";
import { IssueIcon, NotesIcon } from "@/components/icons";
import { InputGroup, TextArea } from "@/components/inputs/index";
import Button from "@/components/Button";
import Feed from "@/components/notes/Feed";
import { type NoteCreate } from "@/api/notes";
import { type User, type Note, type Recording } from "@/api/schemas";

import useRecording from "@/hooks/api/useRecording";

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

function CreateNoteForm({
  onCreate,
}: {
  onCreate?: (note: NoteCreate) => void;
}) {
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-col p-4 w-full">
      <InputGroup
        label="Add a note"
        name="message"
        help="Write the note message and click on the type of note you want to create."
      >
        <TextArea
          name="message"
          value={message}
          placeholder="Type your note here..."
          onChange={(e) => setMessage(e.target.value)}
        />
      </InputGroup>
      <div className="flex flex-row gap-4 justify-end">
        <Button
          variant="danger"
          mode="text"
          onClick={() => {
            setMessage("");
            onCreate?.({
              message,
              is_issue: true,
            });
          }}
        >
          <IssueIcon className="inline-block mr-1 w-5 h-5" />
          Add Issue
        </Button>
        <Button
          variant="primary"
          mode="text"
          onClick={() => {
            setMessage("");
            onCreate?.({
              message,
              is_issue: false,
            });
          }}
        >
          <NotesIcon className="inline-block mr-1 w-5 h-5" />
          Add Note
        </Button>
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
      <CreateNoteForm onCreate={addNote.mutate} />
    </Card>
  );
}
