import { useMemo, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import Loading from "@/lib/components/ui/Loading";
import AnnotationProgressBase from "@/lib/components/annotation/AnnotationProgress";
import type { AnnotationProject, AnnotationTask } from "@/lib/types";
import useAnnotationTasks from "@/app/hooks/api/useAnnotationTasks";

export default function AnnotationProgress({
  selectedTask,
  annotationProject,
  onSelectAnnotationTask,
}: {
  selectedTask?: AnnotationTask | null;
  annotationProject: AnnotationProject;
  onSelectAnnotationTask?: (task: AnnotationTask) => void;
}) {
  const initialFilter = useMemo(
    () => ({
      annotation_project: annotationProject,
      status: "pending",
    }),
    [annotationProject],
  );

  const {
    items: tasks,
    isLoading,
    filter,
  } = useAnnotationTasks({
    filter: initialFilter,
    fixed: ["annotation_project"],
    pageSize: -1,
  });

  const { current, next, prev } = useMemo(() => {
    if (selectedTask == null) {
      return { current: null, next: () => {}, prev: () => {} };
    }

    const index = tasks.findIndex((task) => task.uuid === selectedTask.uuid);

    const next =
      index < tasks.length - 1
        ? () => onSelectAnnotationTask?.(tasks[index + 1])
        : () => {};

    const prev =
      index > 0 ? () => onSelectAnnotationTask?.(tasks[index - 1]) : () => {};

    return {
      current: index,
      next,
      prev,
    };
  }, [onSelectAnnotationTask, selectedTask, tasks]);

  // Select a task if none is selected
  useEffect(() => {
    if (selectedTask == null && tasks.length > 0) {
      onSelectAnnotationTask?.(tasks[0]);
    }
  }, [onSelectAnnotationTask, tasks, selectedTask]);

  useHotkeys("p", prev, {
    description: "Previous Task",
  });

  useHotkeys("n", next, {
    description: "Next task",
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <AnnotationProgressBase
      tasks={tasks}
      instructions={annotationProject.annotation_instructions || ""}
      onNext={next}
      onPrevious={prev}
      current={current}
      filter={filter.filter}
      fixedFilterFields={filter.fixed}
      onSetFilterField={filter.set}
      onClearFilterField={filter.clear}
    />
  );
}
