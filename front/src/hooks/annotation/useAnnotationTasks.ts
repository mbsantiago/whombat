import { useState, useMemo, useCallback } from "react";

import useTasks from "@/hooks/api/useTasks";
import { type AnnotationProject } from "@/api/annotation_projects";

export default function useAnnotationTasks({
  project,
}: {
  project: AnnotationProject;
}) {
  const [current, setCurrent] = useState(0);

  const initialFilter = useMemo(() => {
    return {
      project__eq: project.id,
    };
  }, [project.id]);

  const {
    items,
    filter,
    query: { refetch, isLoading },
  } = useTasks({
    pageSize: 10,
    filter: initialFilter,
  });

  const { pendingFilter, completeFilter } = useMemo(() => {
    const pendingFilter = {
      ...filter.filter,
      pending__eq: true,
    };
    const completeFilter = {
      ...filter.filter,
      pending__eq: false,
    };
    return {
      pendingFilter,
      completeFilter,
    };
  }, [filter.filter]);

  const {
    total: pending,
    query: { refetch: refetchPending },
  } = useTasks({
    pageSize: 0,
    filter: pendingFilter,
  });

  const {
    total: complete,
    query: { refetch: refetchComplete },
  } = useTasks({
    pageSize: 0,
    filter: completeFilter,
  });

  const refresh = useCallback(() => {
    refetch();
    refetchPending();
    refetchComplete();
  }, [refetch, refetchPending, refetchComplete]);

  return {
    tasks: items,
    pending,
    complete,
    total: pending + complete,
    filter: filter,
    isLoading: isLoading,
    current: items[current],
    refresh,
  };
}
