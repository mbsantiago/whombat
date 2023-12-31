import { useCallback, useEffect, useMemo, useState } from "react";

import AnnotationProjectSearch from "@/components/annotation_projects/AnnotationProjectSearch";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { H2, H3 } from "@/components/Headings";
import { AddIcon, TasksIcon } from "@/components/icons";
import { InputGroup } from "@/components/inputs/index";
import Toggle from "@/components/inputs/Toggle";
import useAnnotationTasks from "@/hooks/api/useAnnotationTasks";
import useEvaluationSet from "@/hooks/api/useEvaluationSet";

import type {
  AnnotationProject,
  AnnotationTask,
  ClipAnnotation,
  EvaluationSet,
} from "@/types";

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
      <AnnotationProjectSearch value={selected} onSelect={onSelect} />
    </Card>
  );
}

function FilterAnnotations({
  onChange,
  project,
}: {
  onChange: (annotations: AnnotationTask[]) => void;
  project: AnnotationProject | null;
}) {
  const filter = useMemo(
    () => ({
      annotation_project: project || undefined,
    }),
    [project],
  );

  const tasks = useAnnotationTasks({
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
            isSelected={tasks.filter.get("pending") == false}
            onChange={(checked) => {
              if (checked) {
                tasks.filter.set("pending", false);
              } else {
                tasks.filter.clear("pending");
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
            isSelected={tasks.filter.get("verified") == true}
            onChange={(checked) => {
              if (checked) {
                tasks.filter.set("verified", true);
              } else {
                tasks.filter.clear("verified");
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
  toAdd: AnnotationTask[];
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
      <ul className="list-disc list-inside">
        <li>
          Tasks selected from:{" "}
          <span className="text-emerald-500">{project.name}</span>
        </li>
        <li>
          Tasks to add:{" "}
          <span className="font-bold text-emerald-500">{toAdd.length}</span>
        </li>
      </ul>
      <p className="text-stone-500">
        Once satisfied with your selections, click the button below to add the
        chosen tasks to the evaluation set.
      </p>
      <Button mode="text" variant="primary" padding="p-1" onClick={onAdd}>
        <AddIcon className="inline-block w-4 h-4 mr-1" /> Add tasks
      </Button>
    </Card>
  );
}

export default function EvaluationSetTasks({
  evaluationSet: initialData,
  onAddTasks,
}: {
  evaluationSet: EvaluationSet;
  onAddTasks?: (data: EvaluationSet) => void;
}) {
  const {
    addEvaluationTasks: { mutate: addEvaluationTasks },
  } = useEvaluationSet({
    uuid: initialData.uuid,
    evaluationSet: initialData,
    onAddTasks,
  });

  const [annotationProject, setAnnotationProject] =
    useState<AnnotationProject | null>(null);
  const [tasksToAdd, setTasksToAdd] = useState<AnnotationTask[]>([]);

  const handleOnAdd = useCallback(() => {
    addEvaluationTasks(tasksToAdd);
  }, [addEvaluationTasks, tasksToAdd]);

  return (
    <div className="flex flex-col gap-8">
      <H2>
        <TasksIcon className="inline-block mr-2 w-5 h-5 align-middle" />
        Add Tasks
      </H2>
      <div className="flex flex-row gap-8">
        <div className="flex flex-col gap-y-6 max-w-prose">
          <p className="max-w-prose text-stone-500">
            On this page, you can add tasks to the evaluation set. Choose an
            annotation project to source tasks from, and then filter the tasks
            to add to the evaluation set.
          </p>
          <SelectAnnotationProject
            selected={annotationProject ?? undefined}
            onSelect={setAnnotationProject}
          />
          <FilterAnnotations
            onChange={setTasksToAdd}
            project={annotationProject}
          />
        </div>
        <div className="w-96">
          <div className="sticky top-8 flex flex-col gap-2">
            <ReviewTasks
              toAdd={tasksToAdd}
              project={annotationProject}
              onAdd={handleOnAdd}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
