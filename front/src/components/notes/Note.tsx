import { type ReactNode } from "react";

import { type User, type Note } from "@/api/schemas";
import { DeleteIcon, IssueIcon, NoteIcon } from "@/components/icons";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import useNote from "@/hooks/api/useNote";

export default function Note({
  note: data,
  currentUser,
  actions,
  onUpdate,
  onDelete,
}: {
  note: Note;
  currentUser?: User;
  actions?: ReactNode;
  onUpdate?: (note: Note) => void;
  onDelete?: (note: Note) => void;
}) {
  const note = useNote({
    uuid: data.uuid,
    note: data,
    onUpdate,
  });

  if (note.isLoading || note.data == null) return <Loading />;

  return (
    <li role="article" className="relative p-2 pl-6">
      <div className="flex flex-col flex-1 gap-2">
        <div className="flex absolute -left-3 z-10 flex-row justify-center items-center w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-900">
          {note.data.is_issue ? (
            <IssueIcon className="inline-block w-5 h-5 text-red-500" />
          ) : (
            <NoteIcon className="inline-block w-5 h-5 text-ston-500" />
          )}
        </div>
        <h4 className="flex flex-col items-start text-base font-medium leading-6 md:flex-row lg:items-center text-stone-700 dark:text-stone-300">
          <span className="flex-1">{data.created_by.username}</span>
          <span className="text-xs font-normal text-stone-400">
            {" "}
            {note.data.created_on.toLocaleString()}
          </span>
        </h4>
        <p className="text-sm text-stone-500">{note.data.message}</p>
        <div className="flex flex-row gap-4 justify-end">
          {actions}
          {note.data.is_issue && (
            <Button
              mode="text"
              variant="warning"
              className="text-xs"
              onClick={() => note.update.mutate({ is_issue: false })}
            >
              <IssueIcon className="inline-block mr-1 w-4 h-4" />
              Resolve
            </Button>
          )}
          {currentUser?.id === note.data.created_by.id ? (
            <>
              <Button
                mode="text"
                variant="danger"
                className="text-xs"
                onClick={() => onDelete?.(note.data)}
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
