import { useMemo } from "react";

import Card from "@/components/Card";
import { H3 } from "@/components/Headings";
import { AddIcon, SettingsIcon, TagsIcon, TasksIcon } from "@/components/icons";
import Link from "@/components/Link";
import MetricBadge from "@/components/MetricBadge";

import useEvaluationTasks from "@/hooks/api/useEvaluationTasks";

import type { EvaluationSet } from "@/types";

export default function EvaluationSetOverview({
  evaluationSet,
}: {
  evaluationSet: EvaluationSet;
}) {
  const filter = useMemo(
    () => ({
      evaluation_set__eq: evaluationSet.id,
    }),
    [evaluationSet.id],
  );

  const {
    total,
    query: { isLoading },
  } = useEvaluationTasks({ filter, pageSize: 0 });

  return (
    <Card>
      <div className="flex flex-row justify-between items-center">
        <H3>Overview</H3>
        <Link
          mode="text"
          variant="primary"
          href={`/evaluation/detail/settings?evaluation_set_id=${evaluationSet.id}`}
        >
          <AddIcon className="h-5 w-5 inline-block mr-2" /> Add Evaluation Tasks
        </Link>
      </div>
      <div className="flex flex-row gap-2 justify-around">
        <MetricBadge
          icon={<TasksIcon className="h-8 w-8 inline-block text-blue-500" />}
          title="Num Examples"
          value={total}
          isLoading={isLoading}
        />
        <MetricBadge
          icon={<TagsIcon className="h-8 w-8 inline-block text-blue-500" />}
          title="Num Classes"
          value={evaluationSet.tags.length}
        />
        <MetricBadge
          icon={<SettingsIcon className="h-8 w-8 inline-block text-blue-500" />}
          title="Evaluation Mode"
          value={evaluationSet.mode}
        />
      </div>
    </Card>
  );
}
