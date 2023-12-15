import { useCallback, useMemo, useState } from "react";

import { type AnnotationProject } from "@/api/schemas";
import useAnnotationTasks from "@/hooks/api/useAnnotationTasks";

export default function useTaskAnnotations({
  project,
}: {
  project: AnnotationProject;
}) {
  const [current, setCurrent] = useState(0);

  const totalFilter = useMemo(() => {
    return {
      annotation_project__eq: project.uuid,
    };
  }, [project.uuid]);

  const initialFilter = useMemo(() => {
    return {
      annotation_project__eq: project.uuid,
      pending__eq: true,
    };
  }, [project.uuid]);

  const { items, filter, pagination, refetch, isLoading } = useAnnotationTasks({
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

  const { total, refetch: refetchTotal } = useAnnotationTasks({
    pageSize: 0,
    filter: totalFilter,
  });

  const { total: pending, refetch: refetchPending } = useAnnotationTasks({
    pageSize: 0,
    filter: pendingFilter,
  });

  const { total: complete, refetch: refetchComplete } = useAnnotationTasks({
    pageSize: 0,
    filter: completeFilter,
  });

  const refresh = useCallback(() => {
    refetch();
    refetchPending();
    refetchComplete();
    refetchTotal();
  }, [refetch, refetchPending, refetchComplete, refetchTotal]);

  const { nextPage, prevPage } = pagination;
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
