import { useState, useCallback, useMemo, useEffect } from "react";

import useTasks from "@/hooks/api/useTasks";
import Card from "@/components/Card";
import Button from "@/components/Button";
import SearchAnnotationProjects from "@/components/search/AnnotationProjects";
import Toggle from "@/components/Toggle";
import { InputGroup } from "@/components/inputs";
import { H3 } from "@/components/Headings";
import { AddIcon } from "@/components/icons";
import { type AnnotationProject } from "@/api/annotation_projects";
import { type Task } from "@/api/tasks";
import { type EvaluationSet } from "@/api/evaluation_sets";
import {
  type EvaluationTaskCreate,
  type EvaluationTask,
} from "@/api/evaluation_tasks";

function SelectAnnotationProject({
  selected,
  onSelect,
}: {
  selected?: AnnotationProject;
  onSelect: (project: AnnotationProject) => void;
}) {
  return (
    <Card>
      <div>
        <H3>Select Annotation Project</H3>
        <p className="text-stone-500">
          Choose the annotation project from which to source your ground truth
          data.
        </p>
      </div>
      <SearchAnnotationProjects value={selected} onSelect={onSelect} />
    </Card>
  );
}

function FilterTasks({
  onChange,
  project,
}: {
  onChange: (tasks: Task[]) => void;
  project: AnnotationProject | null;
}) {
  const filter = useMemo(
    () => ({
      project__eq: project?.id ?? -1,
    }),
    [project?.id],
  );

  const tasks = useTasks({
    filter,
    pageSize: -1,
    enabled: project != null,
  });

  useEffect(() => {
    if (tasks.items != null) {
      onChange(tasks.items);
    }
  }, [tasks.items, onChange]);

  return (
    <Card>
      <H3>Filter tasks</H3>
      <p className="text-stone-500">
        Select which tasks from the annotation project to add to the evaluation
        set. Here are some recommended filters:
      </p>
      <div>
        <InputGroup
          label="Completed"
          name="completed"
          help="Only include tasks that have been completed."
        >
          <Toggle
            checked={tasks.filter.get("pending__eq") == false}
            onChange={(checked) => {
              if (checked) {
                tasks.filter.set("pending__eq", false);
              } else {
                tasks.filter.clear("pending__eq");
              }
            }}
          />
        </InputGroup>
        <InputGroup
          label="Verified"
          name="verified"
          help="Only include tasks that have been verified."
        >
          <Toggle
            checked={tasks.filter.get("verified__eq") == true}
            onChange={(checked) => {
              if (checked) {
                tasks.filter.set("verified__eq", true);
              } else {
                tasks.filter.clear("verified__eq");
              }
            }}
          />
        </InputGroup>
      </div>
    </Card>
  );
}

function ReviewTasks({
  toAdd,
  project,
  onAdd,
}: {
  toAdd: Task[];
  project: AnnotationProject | null;
  onAdd: () => void;
}) {
  if (project == null) {
    return (
      <Card>
        <H3>Review</H3>
        <p className="dark:text-red-400 text-red-600">
          To proceed, select an annotation project to add tasks from.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <H3>Review</H3>
      <div className="w-full">
        <p className="text-stone-500">Tasks selected from:</p>
        <p className="text-amber-500 font-bold w-full text-center">
          {project.name}
        </p>
      </div>
      <div className="w-full">
        <p className="text-stone-500">New tasks to add:</p>
        <p className="text-blue-500 font-bold w-full text-center">
          {toAdd.length}
        </p>
      </div>
      <div className="flex flex-row justify-center">
        <Button mode="text" variant="primary" padding="p-1" onClick={onAdd}>
          <AddIcon className="inline-block w-4 h-4 mr-1" /> Add tasks
        </Button>
      </div>
    </Card>
  );
}

function CurrentTasks({ tasks }: { tasks: number }) {
  return (
    <Card>
      <H3>Current tasks</H3>
      <p className="text-stone-500">
        There are{" "}
        <span className="text-blue-500 font-bold">
          {tasks.toLocaleString()}
        </span>{" "}
        tasks currently in this evaluation set.
      </p>
    </Card>
  );
}

export default function EvaluationSetTasks({
  evaluationSet,
  tasks,
  onAddTasks,
}: {
  evaluationSet: EvaluationSet;
  tasks: number;
  onAddTasks: (tasks: EvaluationTaskCreate[]) => Promise<EvaluationTask[]>;
}) {
  const [annotationProject, setAnnotationProject] =
    useState<AnnotationProject | null>(null);
  const [tasksToAdd, setTasksToAdd] = useState<Task[]>([]);

  const onAdd = useCallback(async () => {
    if (annotationProject != null) {
      const tasksCreate = tasksToAdd.map((task) => ({
        task_id: task.id,
        evaluation_set_id: evaluationSet.id,
      }));
      await onAddTasks(tasksCreate);
    }
  }, [annotationProject, evaluationSet, onAddTasks, tasksToAdd]);

  return (
    <div className="flex flex-row gap-8">
      <div className="flex flex-col gap-y-6">
        <SelectAnnotationProject
          selected={annotationProject ?? undefined}
          onSelect={setAnnotationProject}
        />
        <FilterTasks onChange={setTasksToAdd} project={annotationProject} />
      </div>
      <div className="basis-96">
        <div className="sticky top-8 flex flex-col gap-2">
          <CurrentTasks tasks={tasks} />
          <ReviewTasks
            toAdd={tasksToAdd}
            project={annotationProject}
            onAdd={onAdd}
          />
        </div>
      </div>
    </div>
  );
}
