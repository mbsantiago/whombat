import React from "react";

import { type Note as NoteType, type NoteUpdate } from "@/api/notes";
import { type User } from "@/api/user";
import Note from "@/components/Note";

export default function Feed({
  notes,
  currentUser,
  onUpdate,
  onDelete,
}: {
  notes: NoteType[];
  currentUser?: User;
  onUpdate?: (note_id: number, data: NoteUpdate) => void;
  onDelete?: (note_id: number) => void;
}) {
  return (
    <ul
      aria-label="feed"
      role="feed"
      className="relative flex flex-col gap-12 py-12 pl-6 before:absolute before:top-0 before:left-6 before:h-full before:-translate-x-1/2 before:border before:border-dashed before:border-stone-200 before:dark:border-stone-700 after:absolute after:top-6 after:left-6 after:bottom-6 after:-translate-x-1/2 after:border after:border-stone-200 after:dark:border-stone-700"
    >
      {notes.map((note) => (
        <Note
          key={note.id}
          note={note}
          currentUser={currentUser}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
