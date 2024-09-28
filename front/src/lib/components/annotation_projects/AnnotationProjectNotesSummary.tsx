import { type ComponentProps, type FC } from "react";

import { CheckIcon, IssuesIcon } from "@/lib/components/icons";
import Card from "@/lib/components/ui/Card";
import Empty from "@/lib/components/ui/Empty";
import { H3 } from "@/lib/components/ui/Headings";
import Loading from "@/lib/components/ui/Loading";

import type * as types from "@/lib/types";

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
  clipNotes = _emptyClipNotes,
  soundEventNotes = _emptySoundEventNotes,
  SoundEventAnnotationNote,
  ClipAnnotationNote,
}: {
  clipNotes?: types.ClipAnnotationNote[];
  soundEventNotes?: types.SoundEventAnnotationNote[];
  SoundEventAnnotationNote: FC<{
    soundEventAnnotationNote: types.SoundEventAnnotationNote;
  }>;
  ClipAnnotationNote: FC<{ clipAnnotationNote: types.ClipAnnotationNote }>;
}) {
  if (soundEventNotes.length === 0 && clipNotes.length === 0) {
    return <NoIssues />;
  }

  return (
    <div className="flex flex-col gap-4">
      {clipNotes.length === 0 ? null : (
        <div className="flex flex-col gap-2">
          <span className="font-thin">Latest Clip Issues</span>
          <ul className="flex flex-col gap-2 p-2 pl-4 rounded-md border divide-y divide-dashed divide-stone-300 dark:border-stone-800 dark:divide-stone-800">
            {clipNotes.map((issue) => (
              <ClipAnnotationNote
                key={issue.note.uuid}
                clipAnnotationNote={issue}
              />
            ))}
          </ul>
        </div>
      )}
      {soundEventNotes.length === 0 ? null : (
        <div className="flex flex-col gap-2">
          <span className="font-thin">Latest Sound Event Issues</span>
          <ul className="flex flex-col gap-2 p-2 pl-4 rounded-md border divide-y divide-dashed divide-stone-300 dark:border-stone-800 dark:divide-stone-800">
            {soundEventNotes.map((issue) => (
              <SoundEventAnnotationNote
                key={issue.note.uuid}
                soundEventAnnotationNote={issue}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
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

const _emptyClipNotes: types.ClipAnnotationNote[] = [];
const _emptySoundEventNotes: types.SoundEventAnnotationNote[] = [];
