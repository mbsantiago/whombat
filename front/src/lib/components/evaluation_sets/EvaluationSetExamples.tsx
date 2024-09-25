import { useCallback, useEffect, useMemo, useState } from "react";

import useAnnotationTasks from "@/app/hooks/api/useAnnotationTasks";
import useEvaluationSet from "@/app/hooks/api/useEvaluationSet";

import AnnotationProjectSearch from "@/lib/components/annotation_projects/AnnotationProjectSearch";
import { AddIcon, TasksIcon } from "@/lib/components/icons";
import Toggle from "@/lib/components/inputs/Toggle";
import { Group } from "@/lib/components/inputs/index";
import Button from "@/lib/components/ui/Button";
import Card from "@/lib/components/ui/Card";
import { H2, H3 } from "@/lib/components/ui/Headings";

import type {
  AnnotationProject,
  AnnotationTask,
  EvaluationSet,
} from "@/lib/types";

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
      <H3>Filter Annotations</H3>
      <p className="text-stone-500">
        Select which annotations from the annotation project to add to the
        evaluation set as evaluation examples. Here are some recommended
        filters:
      </p>
      <div>
        <Group
          label="Completed"
          name="completed"
          help="Only include clips that have been completely annotated."
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
        </Group>
        <Group
          label="Verified"
          name="verified"
          help="Only include clips that have been verified."
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
        </Group>
      </div>
    </Card>
  );
}

function ReviewExamples({
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
          To proceed, select an annotation project to add examples from.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <H3>Review</H3>
      <ul className="list-disc list-inside">
        <li>
          Examples selected from:{" "}
          <span className="text-emerald-500">{project.name}</span>
        </li>
        <li>
          Examples to add:{" "}
          <span className="font-bold text-emerald-500">{toAdd.length}</span>
        </li>
      </ul>
      <p className="text-stone-500">
        Once satisfied with your selections, click the button below to add the
        chosen examples to the evaluation set.
      </p>
      <Button mode="text" variant="primary" padding="p-1" onClick={onAdd}>
        <AddIcon className="inline-block w-4 h-4 mr-1" /> Add examples
      </Button>
    </Card>
  );
}

export default function EvaluationSetExamples({
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
        Add Examples
      </H2>
      <div className="flex flex-row gap-8">
        <div className="flex flex-col gap-y-6 max-w-prose">
          <p className="max-w-prose text-stone-500">
            On this page, you can add examples to the evaluation set. Choose an
            annotation project to source examples from, and then filter the
            examples to add to the evaluation set.
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
            <ReviewExamples
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
