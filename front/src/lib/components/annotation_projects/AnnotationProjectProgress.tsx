import { useMemo } from "react";

import Card from "@/lib/components/ui/Card";
import Empty from "@/lib/components/Empty";
import { H3 } from "@/lib/components/ui/Headings";
import {
  AddIcon,
  CompleteIcon,
  EditIcon,
  NeedsReviewIcon,
  VerifiedIcon,
} from "@/lib/components/icons";
import Link from "@/lib/components/ui/Link";
import Loading from "@/lib/components/ui/Loading";
import MetricBadge from "@/lib/components/ui/MetricBadge";
import ProgressBar from "@/lib/components/ui/ProgressBar";
import useAnnotationTasks from "@/app/hooks/api/useAnnotationTasks";
import { computeAnnotationTasksProgress } from "@/lib/utils/annotation_tasks";

import type { AnnotationProject } from "@/lib/types";

export default function ProjectProgress({
  annotationProject,
}: {
  annotationProject: AnnotationProject;
}) {
  const filter = useMemo(
    () => ({
      annotation_project: annotationProject,
    }),
    [annotationProject],
  );

  const { items: annotationTasks, isLoading } = useAnnotationTasks({
    filter,
    pageSize: -1,
  });

  const { missing, needReview, completed, verified } = useMemo(() => {
    if (isLoading || annotationTasks == null) {
      return {
        missing: 0,
        needReview: 0,
        completed: 0,
        verified: 0,
      };
    }
    return computeAnnotationTasksProgress(annotationTasks);
  }, [annotationTasks, isLoading]);

  return (
    <Card>
      <div className="flex flex-row justify-between items-center">
        <H3>Annotation Progress</H3>
        <Link
          mode="text"
          variant="primary"
          href={`tasks/?annotation_project_uuid=${annotationProject.uuid}`}
        >
          <AddIcon className="inline-block mr-2 w-5 h-5" /> Add tasks
        </Link>
      </div>
      {isLoading ? (
        <Loading />
      ) : annotationTasks.length === 0 ? (
        <NoTasks />
      ) : (
        <ProgressReport
          annotationTasks={annotationTasks}
          isLoading={isLoading}
          missing={missing}
          needReview={needReview}
          completed={completed}
          verified={verified}
        />
      )}
    </Card>
  );
}

function NoTasks() {
  return (
    <Empty>
      <p>
        No annotation tasks have been created for this project. To begin
        annotating, click the{" "}
        <span className="inline text-emerald-500">Add tasks</span> button above.
      </p>
    </Empty>
  );
}

function ProgressReport({
  annotationTasks,
  isLoading,
  missing,
  needReview,
  completed,
  verified,
}: {
  annotationTasks: any;
  isLoading: boolean;
  missing: number;
  needReview: number;
  completed: number;
  verified: number;
}) {
  return (
    <>
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
        <div className="mb-2 text-stone-500">
          Total tasks: {annotationTasks.length}
        </div>
        <ProgressBar
          total={annotationTasks.length}
          complete={completed}
          verified={verified}
          error={needReview}
        />
      </div>
    </>
  );
}
