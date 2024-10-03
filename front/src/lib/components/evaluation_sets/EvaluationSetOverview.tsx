import {
  AddIcon,
  ModelIcon,
  PredictionTypeIcon,
  TagsIcon,
  TasksIcon,
  UserIcon,
} from "@/lib/components/icons";
import Button from "@/lib/components/ui/Button";
import Card from "@/lib/components/ui/Card";
import Empty from "@/lib/components/ui/Empty";
import { H3 } from "@/lib/components/ui/Headings";
import MetricBadge from "@/lib/components/ui/MetricBadge";

import type { EvaluationSet } from "@/lib/types";

export default function EvaluationSetOverview({
  evaluationSet,
  isLoading = false,
  numExamples = 0,
  numModelRuns = 0,
  numTrainingSessions = 0,
  ...props
}: {
  evaluationSet: EvaluationSet;
  isLoading?: boolean;
  numExamples?: number;
  numModelRuns?: number;
  numTrainingSessions?: number;
  onClickAddTags?: () => void;
  onClickAddExamples?: () => void;
  onClickExamplesBadge?: () => void;
  onClickClassesBadge?: () => void;
  onClickModelRunsBadge?: () => void;
  onClickTrainingSessionsBadge?: () => void;
}) {
  const numClasses = evaluationSet.tags?.length ?? 0;
  return (
    <Card>
      <div className="flex flex-row justify-between items-center">
        <H3>Overview</H3>
        <div className="flex flex-row gap-2">
          <Button mode="text" variant="primary" onClick={props.onClickAddTags}>
            <AddIcon className="inline-block mr-2 w-5 h-5" />
            <TagsIcon className="inline-block mr-2 w-5 h-5" />
            Add Evaluation Tags
          </Button>
          <Button
            mode="text"
            variant="primary"
            onClick={props.onClickAddExamples}
          >
            <AddIcon className="inline-block mr-2 w-5 h-5" />
            <TasksIcon className="inline-block mr-2 w-5 h-5" />
            Add Evaluation Examples
          </Button>
        </div>
      </div>
      <div className="flex flex-row gap-2 justify-around">
        <MetricBadge
          icon={
            <PredictionTypeIcon className="inline-block w-8 h-8 text-blue-500" />
          }
          title="Prediction Type"
          value={evaluationSet.task}
        />
        <MetricBadge
          icon={<TasksIcon className="inline-block w-8 h-8 text-blue-500" />}
          title="Num Examples"
          value={numExamples}
          isLoading={isLoading}
          onClick={props.onClickExamplesBadge}
        />
        <MetricBadge
          icon={<TagsIcon className="inline-block w-8 h-8 text-blue-500" />}
          title="Num Classes"
          value={numClasses}
          onClick={props.onClickClassesBadge}
        />
        <MetricBadge
          icon={<ModelIcon className="inline-block w-8 h-8 text-blue-500" />}
          title="Model Runs"
          isLoading={isLoading}
          value={numModelRuns}
          onClick={props.onClickModelRunsBadge}
        />
        <MetricBadge
          icon={<UserIcon className="inline-block w-8 h-8 text-blue-500" />}
          title="User Training Sessions"
          value={numTrainingSessions}
          isLoading={isLoading}
          onClick={props.onClickTrainingSessionsBadge}
        />
      </div>
      {numExamples === 0 && !isLoading && <NoEvaluationExamples />}
      {numClasses === 0 && <NoEvaluationTags />}
    </Card>
  );
}

function NoEvaluationExamples() {
  return (
    <Empty outerClassName="p-2">
      <div className="inline-flex gap-4 text-amber-500">
        <TasksIcon className="w-8 h-8 text-amber-500" />
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
    <Empty outerClassName="p-2">
      <div className="inline-flex gap-4 text-amber-500">
        <TagsIcon className="w-8 h-8 text-amber-500" />
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
