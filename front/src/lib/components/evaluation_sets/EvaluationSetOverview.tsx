import { useMemo } from "react";

import Card from "@/lib/components/ui/Card";
import Empty from "@/lib/components/Empty";
import { H3 } from "@/lib/components/ui/Headings";
import {
  AddIcon,
  ModelIcon,
  TagsIcon,
  TasksIcon,
  UserIcon,
  TrophyIcon,
} from "@/lib/components/icons";
import Link from "@/lib/components/ui/Link";
import MetricBadge from "@/lib/components/ui/MetricBadge";
import useClipAnnotations from "@/app/hooks/api/useClipAnnotations";
import useModelRuns from "@/app/hooks/api/useModelRuns";
import useUserRuns from "@/app/hooks/api/useUserRuns";

import type { EvaluationSet } from "@/lib/types";

function NoEvaluationExamples() {
  return (
    <Empty padding="p-2">
      <div className="inline-flex gap-4 text-amber-500">
        <TasksIcon className="h-8 w-8 text-amber-500" />
        Missing Evaluation Examples
      </div>
      <div className="text-center">
        No examples are currently assigned to this evaluation set! Please add
        some evaluation examples to get started, by clicking
        <span className="text-emerald-500"> Add Evaluation Examples</span>{" "}
        button above.
      </div>
    </Empty>
  );
}

function NoEvaluationTags() {
  return (
    <Empty padding="p-2">
      <div className="inline-flex gap-4 text-amber-500">
        <TagsIcon className="h-8 w-8 text-amber-500" />
        Missing Evaluation Tags
      </div>
      <div className="text-center">
        No tags are currently assigned to this evaluation set. Please add some
        evaluation tags to get started by clicking
        <span className="text-emerald-500"> Add Evaluation Tags </span> button
        above.
      </div>
    </Empty>
  );
}

export default function EvaluationSetOverview({
  evaluationSet,
}: {
  evaluationSet: EvaluationSet;
}) {
  const filter = useMemo(
    () => ({
      evaluation_set: evaluationSet,
    }),
    [evaluationSet],
  );

  const { total, isLoading } = useClipAnnotations({ filter, pageSize: 0 });
  const { total: modelRuns, isLoading: isLoadingModelRuns } = useModelRuns({
    filter,
    pageSize: 0,
  });
  const { total: userRuns, isLoading: isLoadingUserRuns } = useUserRuns({
    filter,
    pageSize: 0,
  });

  const tags = useMemo(() => evaluationSet.tags || [], [evaluationSet]);

  return (
    <Card>
      <div className="flex flex-row justify-between items-center">
        <H3>Overview</H3>
        <div className="flex flex-row gap-2">
          <Link
            mode="text"
            variant="primary"
            href={`/evaluation/detail/tags/?evaluation_set_uuid=${evaluationSet.uuid}`}
          >
            <AddIcon className="h-5 w-5 inline-block mr-2" />
            <TagsIcon className="h-5 w-5 inline-block mr-2" />
            Add Evaluation Tags
          </Link>
          <Link
            mode="text"
            variant="primary"
            href={`/evaluation/detail/tasks/?evaluation_set_uuid=${evaluationSet.uuid}`}
          >
            <AddIcon className="h-5 w-5 inline-block mr-2" />
            <TasksIcon className="h-5 w-5 inline-block mr-2" />
            Add Evaluation Examples
          </Link>
        </div>
      </div>
      <div className="flex flex-row gap-2 justify-around">
        <MetricBadge
          icon={<TrophyIcon className="h-8 w-8 inline-block text-blue-500" />}
          title="Evaluation Task"
          value={evaluationSet.task}
          isLoading={isLoading}
        />
        <MetricBadge
          icon={<TasksIcon className="h-8 w-8 inline-block text-blue-500" />}
          title="Num Examples"
          value={total}
          isLoading={isLoading}
        />
        <MetricBadge
          icon={<TagsIcon className="h-8 w-8 inline-block text-blue-500" />}
          title="Num Classes"
          value={tags.length}
        />
        <MetricBadge
          icon={<ModelIcon className="h-8 w-8 inline-block text-blue-500" />}
          title="Model Runs"
          isLoading={isLoadingModelRuns}
          value={modelRuns}
        />
        <MetricBadge
          icon={<UserIcon className="h-8 w-8 inline-block text-blue-500" />}
          title="User Training Sessions"
          value={userRuns}
          isLoading={isLoadingUserRuns}
        />
      </div>
      {total === 0 && !isLoading && <NoEvaluationExamples />}
      {tags.length === 0 && <NoEvaluationTags />}
    </Card>
  );
}
