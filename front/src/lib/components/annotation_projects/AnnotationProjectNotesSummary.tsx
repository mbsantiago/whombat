import { useMemo, type ComponentProps } from "react";

import Loading from "@/lib/components/ui/Loading";
import Card from "@/lib/components/ui/Card";
import Empty from "@/lib/components/Empty";
import { H3 } from "@/lib/components/ui/Headings";
import NoteComponent from "@/lib/components/notes/Note";
import { CheckIcon, IssuesIcon } from "@/lib/components/icons";

import type { Note } from "@/lib/types";

export default function ProjectNotesSummary({
  isLoading = false,
  ...props
}: {
  isLoading?: boolean;
} & ComponentProps<typeof IssuesSummary>) {
  return (
    <Card>
      <H3>
        <IssuesIcon className="inline-block mr-2 w-5 h-5" />
        Project Issues
      </H3>
      {isLoading ? <Loading /> : <IssuesSummary {...props} />}
    </Card>
  );
}

function IssuesSummary({
  maxIssues = 10,
  clipNotes = _emptyClipNotes,
  soundEventNotes = _emptySoundEventNotes,
  canDelete = false,
  canResolve = false,
  onClickNote,
  onResolveNote,
  onDeleteNote,
}: {
  clipNotes?: ClipNote[];
  maxIssues?: number;
  soundEventNotes?: SoundEventNote[];
  canDelete?: boolean;
  canResolve?: boolean;
  onClickNote?: (note: ClipNote | SoundEventNote) => void;
  onResolveNote?: (note: ClipNote | SoundEventNote) => void;
  onDeleteNote?: (note: ClipNote | SoundEventNote) => void;
}) {
  const issues = useMemo(() => {
    const clipIssues = clipNotes.filter((clipNote) => clipNote.note.is_issue);

    const soundEventIssues = soundEventNotes.filter(
      (seNote) => seNote.note.is_issue,
    );

    const allNotes = [...clipIssues, ...soundEventIssues].sort((a, b) =>
      a.note.created_on > b.note.created_on ? -1 : 1,
    );

    return allNotes.slice(0, maxIssues);
  }, [maxIssues, clipNotes, soundEventNotes]);

  if (issues.length === 0) return <NoIssues />;

  return (
    <>
      Latest Issues
      <ul className="flex flex-col gap-2 p-2 pl-4 rounded-md border divide-y divide-dashed divide-stone-300 dark:border-stone-800 dark:divide-stone-800">
        {issues.map((issue) => (
          <NoteComponent
            key={issue.note.uuid}
            note={issue.note}
            canDelete={canDelete}
            canResolve={canResolve}
            onClickNote={() => onClickNote?.(issue)}
            onResolveNote={() => onResolveNote?.(issue)}
            onDeleteNote={() => onDeleteNote?.(issue)}
          />
        ))}
      </ul>
    </>
  );
}

function NoIssues() {
  return (
    <Empty>
      <CheckIcon className="w-8 h-8 text-emerald-500" />
      Currently, there are no issues in this project.
    </Empty>
  );
}

type ClipNote = {
  task_uuid: string;
  clip_uuid: string;
  note: Note;
};

type SoundEventNote = {
  task_uuid: string;
  sound_event_uuid: string;
  note: Note;
};

const _emptyClipNotes: ClipNote[] = [];
const _emptySoundEventNotes: SoundEventNote[] = [];
