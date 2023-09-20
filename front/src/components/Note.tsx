import { type ReactNode } from "react";

import { type Note, type NoteUpdate } from "@/api/notes";
import { type User } from "@/api/user";
import { DeleteIcon, EditIcon, IssueIcon, NoteIcon } from "@/components/icons";
import Button from "@/components/Button";

export default function Note({
  note,
  currentUser,
  onUpdate,
  onDelete,
  actions,
}: {
  note: Note;
  currentUser?: User;
  onUpdate?: (note_id: number, data: NoteUpdate) => void;
  onDelete?: (note_id: number) => void;
  actions?: ReactNode;
}) {
  return (
    <li role="article" className="relative pl-6 p-2">
      <div className="flex flex-col flex-1 gap-2">
        <div className="absolute z-10 flex flex-row items-center justify-center w-6 h-6 rounded-full -left-3 bg-stone-100 dark:bg-stone-900">
          {note.is_issue ? (
            <IssueIcon className="h-5 w-5 inline-block text-red-500" />
          ) : (
            <NoteIcon className="h-5 w-5 inline-block text-ston-500" />
          )}
        </div>
        <h4 className="flex flex-col items-start text-base font-medium leading-6 text-stone-700 dark:text-stone-300 md:flex-row lg:items-center">
          <span className="flex-1">{note.created_by.username}</span>
          <span className="text-xs font-normal text-stone-400">
            {" "}
            {note.created_at.toLocaleString()}
          </span>
        </h4>
        <p className="text-sm text-stone-500">{note.message}</p>
        <div className="flex flex-row justify-end gap-4">
          {actions}
          {note.is_issue && onUpdate != null && (
            <Button
              mode="text"
              variant="warning"
              className="text-xs"
              onClick={() => onUpdate?.(note.id, { is_issue: false })}
            >
              <IssueIcon className="h-4 w-4 inline-block mr-1" />
              Resolve
            </Button>
          )}
          {currentUser?.id === note.created_by.id ? (
            <>
              {onUpdate != null ? (
                <Button mode="text" variant="secondary" className="text-xs">
                  <EditIcon className="h-4 w-4 inline-block mr-1" />
                  Edit
                </Button>
              ) : null}
              {onDelete != null ? (
                <Button
                  mode="text"
                  variant="danger"
                  className="text-xs"
                  onClick={() => {
                    onDelete?.(note.id);
                  }}
                >
                  <DeleteIcon className="h-4 w-4 inline-block mr-1" />
                  Remove
                </Button>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </li>
  );
}
