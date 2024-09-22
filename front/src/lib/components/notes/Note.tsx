import {
  DeleteIcon,
  GoToIcon,
  IssueIcon,
  NoteIcon,
} from "@/lib/components/icons";
import Button from "@/lib/components/ui/Button";

import type * as types from "@/lib/types";

export type NoteProps = {
  note: types.Note;
  noteType?: string;
  canDelete?: boolean;
  canResolve?: boolean;
  onClickNote?: () => void;
  onResolveNote?: () => void;
  onDeleteNote?: () => void;
};

export default function Note({
  note,
  canDelete = false,
  canResolve = true,
  noteType = "",
  onClickNote,
  onResolveNote,
  onDeleteNote,
}: NoteProps) {
  return (
    <li role="article" className="relative p-2 pl-6">
      <div className="flex flex-col flex-1 gap-2">
        <div className="flex absolute -left-3 z-10 flex-row justify-center items-center w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-900">
          {note.is_issue ? (
            <IssueIcon className="inline-block w-5 h-5 text-red-500" />
          ) : (
            <NoteIcon className="inline-block w-5 h-5 text-ston-500" />
          )}
        </div>
        <h4 className="flex flex-col items-start text-base font-medium leading-6 md:flex-row lg:items-center text-stone-700 dark:text-stone-300 gap-2">
          <span className="flex-1">
            {note.created_by?.username || "anonymous"}
          </span>
          {noteType != null ? (
            <span className="font-thin">{noteType}</span>
          ) : null}
          <span className="text-xs font-normal text-stone-400">
            {" "}
            {note.created_on.toLocaleString()}
          </span>
        </h4>
        <p className="text-sm text-stone-500">{note.message}</p>
        <div className="flex flex-row gap-4 justify-end">
          {onClickNote == null ? null : (
            <Button mode="text" onClick={onClickNote}>
              <GoToIcon className="inline-block mr-1 w-4 h-4 text-emerald-500" />{" "}
              See
            </Button>
          )}
          {note.is_issue && canResolve && (
            <Button
              mode="text"
              variant="warning"
              className="text-xs"
              onClick={onResolveNote}
            >
              <IssueIcon className="inline-block mr-1 w-4 h-4" />
              Resolve
            </Button>
          )}
          {canDelete ? (
            <>
              <Button
                mode="text"
                variant="danger"
                className="text-xs"
                onClick={onDeleteNote}
              >
                <DeleteIcon className="inline-block mr-1 w-4 h-4" />
                Remove
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </li>
  );
}
