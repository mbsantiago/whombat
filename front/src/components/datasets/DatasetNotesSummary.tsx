import { useMemo } from "react";

import { type Dataset, type Note as NoteType } from "@/api/schemas";
import Loading from "@/app/loading";
import Card from "@/components/Card";
import { H3 } from "@/components/Headings";
import { CheckIcon, NotesIcon } from "@/components/icons";
import Note from "@/components/notes/Note";
import useNotes from "@/hooks/api/useNotes";

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
}: {
  notes: NoteType[];
  maxIssues?: number;
}) {
  const issues = useMemo(
    () => notes.filter((note) => note.is_issue).slice(0, maxIssues),
    [notes, maxIssues],
  );
  if (issues.length === 0) return <NoIssues />;

  return (
    <>
      Latest Issues
      <ul className="flex flex-col gap-2 p-2 pl-4 rounded-md border divide-y divide-dashed divide-stone-300 dark:border-stone-800 dark:divide-stone-800">
        {issues.map((issue) => (
          <Note key={issue.uuid} note={issue} />
        ))}
      </ul>
    </>
  );
}

/**
 * Component to display a summary of notes and issues for a dataset.
 *
 * @param dataset - The dataset for which to display the notes summary.
 * @returns JSX element displaying the notes and issues summary.
 */
export default function DatasetNotesSumary({ dataset }: { dataset: Dataset }) {
  const filter = useMemo(
    () => ({
      dataset__eq: dataset.uuid,
    }),
    [dataset.uuid],
  );
  const notes = useNotes({ pageSize: -1, filter });

  return (
    <Card>
      <H3>
        <NotesIcon className="inline-block mr-2 w-6 h-6 text-emerald-500" />
        Notes and Issues
      </H3>
      {notes.isLoading ? <Loading /> : <IssuesSummary notes={notes.items} />}
    </Card>
  );
}
