import { IssueIcon, RecordingsIcon, WarningIcon } from "@/lib/components/icons";
import Button from "@/lib/components/ui/Button";
import Card from "@/lib/components/ui/Card";
import { H3 } from "@/lib/components/ui/Headings";
import MetricBadge from "@/lib/components/ui/MetricBadge";

import type { Dataset } from "@/lib/types";

export default function DatasetOverview({
  dataset,
  numIssues = 0,
  numMissing = 0,
  isLoading = false,
  onClickDatasetRecordings,
  onClickDatasetIssues,
  onClickDatasetMissing,
}: {
  dataset: Dataset;
  numIssues?: number;
  numMissing?: number;
  isLoading?: boolean;
  onClickDatasetRecordings?: () => void;
  onClickDatasetIssues?: () => void;
  onClickDatasetMissing?: () => void;
}) {
  return (
    <Card>
      <div className="flex flex-row justify-between">
        <H3>Dataset Overview</H3>
      </div>
      <div className="flex flex-row gap-2 justify-around">
        <MetricBadge
          onClick={onClickDatasetRecordings}
          icon={
            <RecordingsIcon className="inline-block w-8 h-8 text-blue-500" />
          }
          title="Recordings"
          value={dataset.recording_count}
        />
        <MetricBadge
          onClick={onClickDatasetIssues}
          icon={<IssueIcon className="inline-block w-8 h-8 text-amber-500" />}
          title="Metadata Issues"
          value={numIssues}
          isLoading={isLoading}
        />
        <MetricBadge
          onClick={onClickDatasetMissing}
          icon={<WarningIcon className="inline-block w-8 h-8 text-red-500" />}
          title="Missing Files"
          value={numMissing}
          isLoading={isLoading}
        />
      </div>
    </Card>
  );
}
