import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import Card from "@/components/Card";
import { H3 } from "@/components/Headings";
import {
  IssueIcon,
  NewRecordingIcon,
  RecordingsIcon,
  WarningIcon,
} from "@/components/icons";
import MetricBadge from "@/components/MetricBadge";
import { type RecordingNote } from "@/api/recordings";
import { type Dataset } from "@/api/datasets";

export default function DatasetOverview({
  dataset,
  notes = [],
  missing = 0,
  newFiles = 0,
}: {
  dataset: Dataset;
  notes?: RecordingNote[];
  missing?: number;
  newFiles?: number;
}) {
  const params = useSearchParams();

  const issues = useMemo(() => {
    return notes.filter((recordingNote) => recordingNote.note.is_issue).length;
  }, [notes]);

  return (
    <Card>
      <div className="flex flex-row justify-between">
        <H3>Dataset Overview</H3>
      </div>
      <div className="flex flex-row gap-2 justify-around">
        <MetricBadge
          icon={
            <Link href={`/datasets/detail/recordings?${params.toString()}`}>
              <RecordingsIcon className="h-8 w-8 inline-block text-blue-500" />
            </Link>
          }
          title="Recordings"
          value={dataset.recording_count}
        />
        <MetricBadge
          icon={<IssueIcon className="h-8 w-8 inline-block text-amber-500" />}
          title="Metadata Issues"
          value={issues}
        />
        <MetricBadge
          icon={<WarningIcon className="h-8 w-8 inline-block text-red-500" />}
          title="Missing Files"
          value={missing}
        />
        <MetricBadge
          icon={
            <NewRecordingIcon className="h-8 w-8 inline-block text-emerald-500" />
          }
          title="New Files Detected"
          value={newFiles}
        />
      </div>
    </Card>
  );
}
