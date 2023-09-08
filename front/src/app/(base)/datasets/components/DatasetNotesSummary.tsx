import Card from "@/components/Card";
import { H3 } from "@/components/Headings";
import { type RecordingNote } from "@/api/recordings";
import { NotesIcon, CheckIcon } from "@/components/icons";
import Loading from "@/app/loading";

function NoIssues() {
  return (
    <div>
      <CheckIcon className="h-6 w-6 inline-block text-emerald-500 mr-2" />
      There are no issues
    </div>
  );
}

function LatestIssues() {
  return <div>Issues</div>;
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
        Notes
      </H3>
      {isLoading ? (
        <Loading />
      ) : notes.length === 0 ? (
        <NoIssues />
      ) : (
        <LatestIssues />
      )}
      {isLoading ? null : <TotalNotes notes={notes} />}
    </Card>
  );
}
