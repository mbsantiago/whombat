import { useMemo } from "react";
import Card from "@/components/Card";
import Link from "next/link";
import Note from "@/components/Note";
import { H3 } from "@/components/Headings";
import { type RecordingNote } from "@/api/recordings";
import { NotesIcon, CheckIcon, GoToIcon } from "@/components/icons";
import Loading from "@/app/loading";

function NoIssues() {
  return (
    <div>
      <CheckIcon className="h-6 w-6 inline-block text-emerald-500 mr-2" />
      There are no issues
    </div>
  );
}

function LatestIssues({
  notes,
  maxIssues = 5,
}: {
  notes: RecordingNote[];
  maxIssues?: number;
}) {
  const issues = useMemo(
    () =>
      notes
        .filter((recordingNote) => recordingNote.note.is_issue)
        .slice(0, maxIssues),
    [notes, maxIssues],
  );
  return (
    <ul className="flex flex-col p-2 pl-4 border rounded-md dark:border-stone-800 divide-y divide-dashed divide-stone-300 dark:divide-stone-800 gap-2">
      {issues.map((issue) => (
        <Note
          key={issue.note.id}
          note={issue.note}
          actions={
            <Link
              className="group text-sm text-stone-500 hover:underline hover:decoration-2 decoration-emerald-500/0 hover:decoration-emerald-500/100 hover:underline-offset-2 transition"
              href={{
                pathname: "/recordings/",
                query: { recording_id: issue.recording_id },
              }}
            >
              <GoToIcon className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 inline-block transition" />
              View
            </Link>
          }
        />
      ))}
    </ul>
  );
}

function TotalNotes({ notes }: { notes: RecordingNote[] }) {
  return (
    <div className="text-stone-500 text-sm">
      {notes.length === 0
        ? "No notes"
        : `There are ${notes.length} notes in this dataset.`}
    </div>
  );
}

export default function DatasetNotesSumary({
  notes,
  isLoading = false,
}: {
  notes: RecordingNote[];
  isLoading?: boolean;
}) {
  return (
    <Card>
      <H3>
        <NotesIcon className="h-6 w-6 inline-block text-emerald-500 mr-2" />
        Notes and Issues
      </H3>
      {isLoading ? (
        <Loading />
      ) : notes.length === 0 ? (
        <NoIssues />
      ) : (
        <>
          Latest Issues
          <LatestIssues notes={notes} />
        </>
      )}
    </Card>
  );
}
