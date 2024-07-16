import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import Card from "@/lib/components/ui/Card";
import { H3 } from "@/lib/components/ui/Headings";
import {
  IssueIcon,
  NewRecordingIcon,
  RecordingsIcon,
  WarningIcon,
} from "@/lib/components/icons";
import MetricBadge from "@/lib/components/ui/MetricBadge";
import useDataset from "@/app/hooks/api/useDataset";
import useNotes from "@/app/hooks/api/useNotes";

import type { Dataset } from "@/lib/types";

export default function DatasetOverview({ dataset }: { dataset: Dataset }) {
  const params = useSearchParams();

  const { state } = useDataset({
    uuid: dataset.uuid,
    dataset,
    enabled: false,
    withState: true,
  });

  const filter = useMemo(
    () => ({ dataset: dataset, is_issue: true }),
    [dataset],
  );

  const issues = useNotes({
    filter,
    pageSize: 0,
  });

  const { missing, newRecordings } = useMemo(() => {
    if (state.isLoading || state.data == null)
      return { missing: 0, newRecordings: 0 };
    return state.data.reduce(
      (acc, recording) => {
        if (recording.state == "missing") acc.missing++;
        if (recording.state == "unregistered") acc.newRecordings++;
        return acc;
      },
      { missing: 0, newRecordings: 0 },
    );
  }, [state]);

  return (
    <Card>
      <div className="flex flex-row justify-between">
        <H3>Dataset Overview</H3>
      </div>
      <div className="flex flex-row gap-2 justify-around">
        <MetricBadge
          icon={
            <Link href={`/datasets/detail/recordings?${params.toString()}`}>
              <RecordingsIcon className="inline-block w-8 h-8 text-blue-500" />
            </Link>
          }
          title="Recordings"
          value={dataset.recording_count}
        />
        <MetricBadge
          icon={<IssueIcon className="inline-block w-8 h-8 text-amber-500" />}
          title="Metadata Issues"
          value={issues.total}
          isLoading={issues.isLoading}
        />
        <MetricBadge
          icon={<WarningIcon className="inline-block w-8 h-8 text-red-500" />}
          title="Missing Files"
          value={missing}
          isLoading={state.isLoading}
        />
      </div>
    </Card>
  );
}
