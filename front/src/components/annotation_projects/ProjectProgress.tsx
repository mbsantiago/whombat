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
import { type AnnotationTask } from "@/api/schemas";
import { computeAnnotationProjectProgress } from "@/utils/annotation_projects";

export default function ProjectProgress({
  tasks,
  isLoading = false,
}: {
  tasks: AnnotationTask[];
  isLoading?: boolean;
}) {
  const { missing, needReview, completed, verified } = useMemo(
    () => computeAnnotationProjectProgress(tasks),
    [tasks],
  );

  return (
    <Card>
      <div className="flex flex-row justify-between items-center">
        <H3>Task Progress</H3>
        <Button mode="text" variant="primary">
          <AddIcon className="inline-block mr-2 w-5 h-5" /> Add tasks
        </Button>
      </div>
      <div className="flex flex-row gap-2 justify-around">
        <MetricBadge
          icon={<EditIcon className="inline-block w-8 h-8 text-blue-500" />}
          title="Remaining"
          value={missing}
          isLoading={isLoading}
        />
        <MetricBadge
          icon={
            <NeedsReviewIcon className="inline-block w-8 h-8 text-red-500" />
          }
          title="Need Review"
          value={needReview}
          isLoading={isLoading}
        />
        <MetricBadge
          icon={
            <CompleteIcon className="inline-block w-8 h-8 text-emerald-500" />
          }
          title="Completed"
          value={completed}
          isLoading={isLoading}
        />
        <MetricBadge
          icon={
            <VerifiedIcon className="inline-block w-8 h-8 text-amber-500" />
          }
          title="Verified"
          value={verified}
          isLoading={isLoading}
        />
      </div>
      <div className="mt-4">
        <div className="mb-2 text-stone-500">Total tasks: {tasks.length}</div>
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
