import { type ComponentProps, useMemo } from "react";

import { CheckIcon, NotesIcon } from "@/lib/components/icons";
import NoteComponent from "@/lib/components/notes/Note";
import Card from "@/lib/components/ui/Card";
import { H3 } from "@/lib/components/ui/Headings";
import Loading from "@/lib/components/ui/Loading";

import type * as types from "@/lib/types";

/**
 * Component to display a summary of notes and issues for a dataset.
 *
 * @param dataset - The dataset for which to display the notes summary.
 * @returns JSX element displaying the notes and issues summary.
 */
export default function DatasetNotesSumary({
  isLoading = false,
  ...props
}: {
  isLoading?: boolean;
} & ComponentProps<typeof IssuesSummary>) {
  return (
    <Card>
      <H3>
        <NotesIcon className="inline-block mr-2 w-6 h-6 text-emerald-500" />
        Notes and Issues
      </H3>
      {isLoading ? <Loading /> : <IssuesSummary {...props} />}
    </Card>
  );
}

/**
 * Component to display a list of the latest issues in the dataset.
 *
 * @param notes - An array of note instances representing issues.
 * @param maxIssues - The maximum number of issues to display (default is 5).
 * @returns JSX element displaying a list of issues.
 */
function IssuesSummary({
  notes,
  maxIssues = 5,
  canDelete = false,
  canResolve = false,
  onClickNote,
  onDeleteNote,
  onResolveNote,
}: {
  notes: types.RecordingNote[];
  maxIssues?: number;
  canResolve?: boolean;
  canDelete?: boolean;
  onClickNote?: (note: types.RecordingNote) => void;
  onDeleteNote?: (note: types.RecordingNote) => void;
  onResolveNote?: (note: types.RecordingNote) => void;
}) {
  const issues = useMemo(
    () =>
      notes
        .filter((recordingNote) => recordingNote.note.is_issue)
        .slice(0, maxIssues),
    [notes, maxIssues],
  );

  if (issues.length === 0) return <NoIssues />;

  return (
    <>
      Latest Issues
      <ul className="flex flex-col gap-2 p-2 pl-4 rounded-md border divide-y divide-dashed divide-stone-300 dark:border-stone-800 dark:divide-stone-800">
        {issues.map((recordingNote) => (
          <NoteComponent
            key={recordingNote.note.uuid}
            note={recordingNote.note}
            canDelete={canDelete}
            canResolve={canResolve}
            onClickNote={() => onClickNote?.(recordingNote)}
            onResolveNote={() => onResolveNote?.(recordingNote)}
            onDeleteNote={() => onDeleteNote?.(recordingNote)}
          />
        ))}
      </ul>
    </>
  );
}

/**
 * Component to display a message when there are no issues in the dataset.
 *
 * @returns JSX element displaying a success message.
 */
function NoIssues() {
  return (
    <div>
      <CheckIcon className="inline-block mr-2 w-6 h-6 text-emerald-500" />
      There are no issues
    </div>
  );
}
