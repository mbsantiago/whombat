import { useMemo } from "react";

import Button from "@/components/Button";
import MetricBadge from "@/components/MetricBadge";
import {
  AddIcon,
  CompleteIcon,
  EditIcon,
  NeedsReviewIcon,
  VerifiedIcon,
} from "@/components/icons";
import Card from "@/components/Card";
import ProgressBar from "@/components/ProgressBar";
import { H3 } from "@/components/Headings";
import { type Task } from "@/api/tasks";
import { computeTaskProgress } from "@/utils/annotation_projects";

export default function ProjectProgress({
  tasks,
  isLoading = false,
}: {
  tasks: Task[];
  isLoading?: boolean;
}) {
  const { missing, needReview, completed, verified } = useMemo(
    () => computeTaskProgress(tasks),
    [tasks],
  );

  return (
    <Card>
      <div className="flex flex-row justify-between items-center">
        <H3>Task Progress</H3>
        <Button mode="text" variant="primary">
          <AddIcon className="h-5 w-5 inline-block mr-2" /> Add tasks
        </Button>
      </div>
      <div className="flex flex-row gap-2 justify-around">
        <MetricBadge
          icon={<EditIcon className="h-8 w-8 inline-block text-blue-500" />}
          title="Remaining"
          value={missing}
          isLoading={isLoading}
        />
        <MetricBadge
          icon={
            <NeedsReviewIcon className="h-8 w-8 inline-block text-red-500" />
          }
          title="Need Review"
          value={needReview}
          isLoading={isLoading}
        />
        <MetricBadge
          icon={
            <CompleteIcon className="h-8 w-8 inline-block text-emerald-500" />
          }
          title="Completed"
          value={completed}
          isLoading={isLoading}
        />
        <MetricBadge
          icon={
            <VerifiedIcon className="h-8 w-8 inline-block text-amber-500" />
          }
          title="Verified"
          value={verified}
          isLoading={isLoading}
        />
      </div>
      <div className="mt-4">
        <div className="text-stone-500 mb-2">Total tasks: {tasks.length}</div>
        <ProgressBar
          total={tasks.length}
          complete={completed}
          verified={verified}
          error={needReview}
        />
      </div>
    </Card>
  );
}
