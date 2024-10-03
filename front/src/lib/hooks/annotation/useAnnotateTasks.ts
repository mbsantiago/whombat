import {
  type UseMutationResult,
  type UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";

import useAnnotationTasks from "@/app/hooks/api/useAnnotationTasks";

import api from "@/app/api";

import type {
  AnnotationStatus,
  AnnotationTask,
  AnnotationTaskFilter,
  ClipAnnotation,
  Page,
} from "@/lib/types";

type AnnotationState = {
  /** Currently selected annotation task index */
  current: number | null;
  /** Currently selected annotation task */
  task: AnnotationTask | null;
  /** Clip annotations for the current task */
  annotations: UseQueryResult<ClipAnnotation, AxiosError>;
  /** Filter used to select which annotation tasks to show */
  filter: AnnotationTaskFilter;
  /** List of annotation tasks matching the filter */
  tasks: AnnotationTask[];
  /** Whether the annotation tasks are currently being fetched */
  isLoading: boolean;
  /** Whether there was an error fetching the annotation tasks */
  isError: boolean;
  /** Whether there is a next annotation task */
  hasNextTask: boolean;
  /** Whether there is a previous annotation task */
  hasPrevTask: boolean;
};

type AnnotationControls = {
  /** Select a specific annotation task */
  goToTask: (task: AnnotationTask) => void;
  /** Select the next annotation task */
  nextTask: () => void;
  /** Select the previous annotation task */
  prevTask: () => void;
  /** Change the filter used to select which annotation tasks to show */
  setFilter: <T extends keyof AnnotationTaskFilter>(
    key: T,
    value: AnnotationTaskFilter[T],
  ) => void;
  clearFilter: <T extends keyof AnnotationTaskFilter>(field: T) => void;
  /** Select a random annotation task */
  selectRandomTask: () => void;
  /** Mark the current task as completed */
  markCompleted: UseMutationResult<AnnotationTask, AxiosError, void>;
  /** Mark the current task as rejected */
  markRejected: UseMutationResult<AnnotationTask, AxiosError, void>;
  /** Mark the current task as verified */
  markVerified: UseMutationResult<AnnotationTask, AxiosError, void>;
  /** Remove a badge from the current task */
  removeBadge: UseMutationResult<AnnotationTask, AxiosError, AnnotationStatus>;
};

const empty = {};

export default function useAnnotateTasks({
  filter: initialFilter = empty,
  annotationTask: initialTask,
  onChangeTask,
  onCompleteTask,
  onRejectTask,
  onVerifyTask,
}: {
  /** Initial filter to select which annotation tasks to show */
  filter?: AnnotationTaskFilter;
  /** Optional, initial annotation task to select */
  annotationTask?: AnnotationTask;
  /** Callback when the selected annotation task changes */
  onChangeTask?: (task: AnnotationTask) => void;
  /** Callback when the current task is marked as completed */
  onCompleteTask?: (task: AnnotationTask) => void;
  /** Callback when the current task is marked as rejected */
  onRejectTask?: (task: AnnotationTask) => void;
  /** Callback when the current task is marked as verified */
  onVerifyTask?: (task: AnnotationTask) => void;
}): AnnotationState & AnnotationControls {
  const [currentTask, setCurrentTask] = useState<AnnotationTask | null>(
    initialTask ?? null,
  );

  const client = useQueryClient();

  const { items, filter, isLoading, isError, queryKey } = useAnnotationTasks({
    pageSize: -1,
    filter: initialFilter,
    fixed: Object.keys(initialFilter) as (keyof AnnotationTaskFilter)[],
  });

  const index = useMemo(() => {
    if (currentTask === null) return -1;
    return items.findIndex((item) => item.uuid === currentTask.uuid);
  }, [currentTask, items]);

  const goToTask = useCallback(
    (task: AnnotationTask) => {
      client.setQueryData(["annotation_task", task.uuid], task);
      setCurrentTask(task);
      onChangeTask?.(task);
    },
    [onChangeTask, client],
  );

  const hasNextTask = useMemo(() => {
    if (index !== -1) {
      return index < items.length - 1;
    }
    return items.length > 0;
  }, [index, items.length]);

  const nextTask = useCallback(() => {
    if (!hasNextTask) return;
    if (index === -1) {
      goToTask(items[0]);
    } else {
      goToTask(items[index + 1]);
    }
  }, [index, items, hasNextTask, goToTask]);

  const hasPrevTask = useMemo(() => {
    if (index !== -1) {
      return index > 0;
    }
    return items.length > 0;
  }, [index, items.length]);

  const prevTask = useCallback(() => {
    if (!hasPrevTask) return;
    if (index === -1) {
      goToTask(items[0]);
    } else {
      goToTask(items[index - 1]);
    }
  }, [index, items, hasPrevTask, goToTask]);

  const { set: setFilterKeyValue } = filter;
  const setFilter = useCallback(
    <T extends keyof AnnotationTaskFilter>(
      key: T,
      value: AnnotationTaskFilter[T],
    ) => {
      setFilterKeyValue(key, value);
    },
    [setFilterKeyValue],
  );

  const queryFn = useCallback(async () => {
    if (currentTask == null) {
      throw new Error("No selected task");
    }
    return api.annotationTasks.getAnnotations(currentTask);
  }, [currentTask]);

  const annotations = useQuery<ClipAnnotation, AxiosError>({
    queryKey: ["annotation_task", currentTask?.uuid, "annotations"],
    queryFn,
    enabled: currentTask != null,
  });

  const updateTaskData = useCallback(
    (task: AnnotationTask) => {
      client.setQueryData(["annotation_task", task.uuid], task);
      client.setQueryData(queryKey, (old: Page<AnnotationTask>) => {
        if (old == null) return old;
        return {
          ...old,
          items: old.items.map((item) => {
            if (item.uuid === task.uuid) {
              return task;
            }
            return item;
          }),
        };
      });
      setCurrentTask(task);
    },
    [client, queryKey],
  );

  const markCompletedFn = useCallback(async () => {
    if (currentTask == null) {
      throw new Error("No selected task");
    }
    return api.annotationTasks.addBadge(currentTask, "completed");
  }, [currentTask]);

  const markCompleted = useMutation<AnnotationTask, AxiosError>({
    mutationFn: markCompletedFn,
    onSuccess: (task) => {
      updateTaskData(task);
      onCompleteTask?.(task);
      nextTask();
    },
  });

  const markRejectedFn = useCallback(async () => {
    if (currentTask == null) {
      throw new Error("No selected task");
    }
    return api.annotationTasks.addBadge(currentTask, "rejected");
  }, [currentTask]);

  const markRejected = useMutation<AnnotationTask, AxiosError>({
    mutationFn: markRejectedFn,
    onSuccess: (task) => {
      updateTaskData(task);
      onRejectTask?.(task);
      nextTask();
    },
  });

  const markVerifiedFn = useCallback(async () => {
    if (currentTask == null) {
      throw new Error("No selected task");
    }
    return api.annotationTasks.addBadge(currentTask, "verified");
  }, [currentTask]);

  const markVerified = useMutation<AnnotationTask, AxiosError>({
    mutationFn: markVerifiedFn,
    onSuccess: (task) => {
      updateTaskData(task);
      onVerifyTask?.(task);
      nextTask();
    },
  });

  const removeBadgeFn = useCallback(
    async (status: AnnotationStatus) => {
      if (currentTask == null) {
        throw new Error("No selected task");
      }
      return api.annotationTasks.removeBadge(currentTask, status);
    },
    [currentTask],
  );

  const removeBadge = useMutation<AnnotationTask, AxiosError, AnnotationStatus>(
    {
      mutationFn: removeBadgeFn,
      onSuccess: (task) => {
        updateTaskData(task);
      },
    },
  );

  const selectRandomTask = useCallback(() => {
    if (items.length === 0) return;
    const task = items[Math.floor(Math.random() * items.length)];
    setCurrentTask(task);
    onChangeTask?.(task);
  }, [items, onChangeTask]);

  useEffect(() => {
    if (currentTask == null && items.length > 0) {
      goToTask(items[0]);
    }
  }, [currentTask, items, goToTask]);

  return {
    current: index,
    task: currentTask,
    filter: filter.filter,
    tasks: items,
    clearFilter: filter.clear,
    isLoading,
    isError,
    goToTask,
    hasNextTask,
    hasPrevTask,
    nextTask,
    prevTask,
    setFilter,
    annotations,
    markCompleted,
    markRejected,
    markVerified,
    removeBadge,
    selectRandomTask,
  };
}
