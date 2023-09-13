import { useState } from "react";
import Card from "@/components/Card";
import { H3 } from "@/components/Headings";
import { NotesIcon, IssueIcon } from "@/components/icons";
import { TextArea, InputGroup } from "@/components/inputs";
import Button from "@/components/Button";
import Feed from "@/components/Feed";

import { type Note, type NoteCreate, type NoteUpdate } from "@/api/notes";
import { type User } from "@/api/user";

function NoNotes() {
  return (
    <div className="p-4 w-full">
      <div className="border border-dashed rounded-lg border-stone-500 flex flex-col justify-center items-center w-full p-8 bg-stone-300 dark:bg-stone-800">
        <span className="text-stone-700 dark:text-stone-300">
          <NotesIcon className="h-5 w-5 inline-block mr-1" /> No notes
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
    <div className="p-4 flex flex-col w-full">
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
          <IssueIcon className="h-5 w-5 inline-block mr-1" />
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
          <NotesIcon className="h-5 w-5 inline-block mr-1" />
          Add Note
        </Button>
      </div>
    </div>
  );
}

export default function RecordingNotes({
  notes,
  currentUser,
  onCreate,
  onUpdate,
  onDelete,
}: {
  notes: Note[];
  currentUser?: User;
  onCreate?: (note: NoteCreate) => void;
  onUpdate?: (note_id: number, note: NoteUpdate) => void;
  onDelete?: (note_id: number) => void;
}) {
  return (
    <Card>
      <H3>
        <NotesIcon className="h-5 w-5 inline-block mr-1" />
        Notes
      </H3>
      <CreateNoteForm onCreate={onCreate} />
      {notes.length === 0 ? (
        <NoNotes />
      ) : (
        <Feed
          notes={notes}
          onDelete={onDelete}
          onUpdate={onUpdate}
          currentUser={currentUser}
        />
      )}
    </Card>
  );
}
