import { useCallback, useMemo, useState } from "react";

import { type AnnotationProject } from "@/api/annotation_projects";
import useTasks from "@/hooks/api/useTasks";

export default function useAnnotationTasks({
  project,
}: {
  project: AnnotationProject;
}) {
  const [current, setCurrent] = useState(0);

  const totalFilter = useMemo(() => {
    return {
      project__eq: project.id,
    };
  }, [project.id]);

  const initialFilter = useMemo(() => {
    return {
      project__eq: project.id,
      pending__eq: true,
    };
  }, [project.id]);

  const {
    items,
    filter,
    pagination,
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
    total,
    query: { refetch: refetchTotal },
  } = useTasks({
    pageSize: 0,
    filter: totalFilter,
  });

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
    refetchTotal();
  }, [refetch, refetchPending, refetchComplete, refetchTotal]);

  const { nextPage, prevPage } = pagination
  const next = useCallback(() => {
    setCurrent((prev) => {
      if (prev + 1 >= items.length) {
        nextPage();
        return 0;
      }
      return prev + 1;
    });
  }, [items.length, nextPage]);

  const previous = useCallback(() => {
    setCurrent((prev) => {
      if (prev - 1 < 0) {
        prevPage();
        return items.length - 1;
      }
      return prev - 1;
    });
  }, [items.length, prevPage]);

  return {
    tasks: items,
    pending,
    complete,
    total,
    filter: filter,
    isLoading: isLoading,
    current: items[current],
    refresh,
    next,
    previous,
  };
}
