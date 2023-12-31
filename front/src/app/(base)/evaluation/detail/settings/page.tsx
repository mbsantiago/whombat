"use client";
import { useCallback, useContext, useMemo } from "react";
import toast from "react-hot-toast";

import { EvaluationSetContext } from "@/app/contexts";
import Card from "@/components/Card";
import EvaluationSetTags from "@/components/evaluation_sets/EvaluationSetTags";
import EvaluationSetTasks from "@/components/evaluation_sets/EvaluationSetTasks";
import { H3, H4 } from "@/components/Headings";
import { SettingsIcon, TagsIcon, TasksIcon } from "@/components/icons";

import { type EvaluationTaskCreate } from "@/api/evaluation_tasks";
import useEvaluationTasks from "@/hooks/api/useEvaluationTasks";

export default function Page() {
  const { evaluationSet, addTag, removeTag } = useContext(EvaluationSetContext);

  const filter = useMemo(
    () => ({
      evaluation_set: evaluationSet,
    }),
    [evaluationSet],
  );

  const {
    total,
    create: { mutateAsync: addTasks },
  } = useEvaluationTasks({
    filter,
    pageSize: 0,
  });

  const onAddTasks = useCallback(
    async (data: EvaluationTaskCreate[]) => {
      return await toast.promise(addTasks(data), {
        loading: "Adding tasks...",
        success: "Tasks added!",
        error: "Could not add tasks.",
      });
    },
    [addTasks],
  );

  return (
    <div className="p-4 flex flex-col gap-4">
      <H3>
        <SettingsIcon className="h-6 w-6 align-middle inline-block mr-2" />
        Evaluation Set Settings
      </H3>
      <Card>
        <H4>
          <TagsIcon className="h-6 w-6 align-middle inline-block mr-2" />
          Evaluation Tags
        </H4>
        <EvaluationSetTags
          evaluationSet={evaluationSet}
          onAddTag={addTag}
          onRemoveTag={removeTag}
        />
      </Card>
      <Card>
        <H4>
          <TasksIcon className="h-6 w-6 align-middle inline-block mr-2" />
          Evaluation Tasks
        </H4>
        <p>
          Use the options below to add more evaluation tasks to this evaluation
          set.
        </p>
        <EvaluationSetTasks
          evaluationSet={evaluationSet}
          tasks={total}
          onAddTasks={onAddTasks}
        />
      </Card>
    </div>
  );
}
