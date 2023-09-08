import { type TaskFilter } from "@/api/tasks";
// import { type Task, type TaskCreate } from "@/api/tasks";
import api from "@/app/api";
// import { useMutation } from "@tanstack/react-query";
import usePagedQuery from "@/hooks/usePagedQuery";
import useFilter from "@/hooks/useFilter";

export default function useTasks({
  filter: initialFilter = {},
  pageSize = 10,
}: {
  filter?: TaskFilter;
  pageSize?: number;
} = {}) {
  const filter = useFilter<TaskFilter>({
    fixed: initialFilter,
  });

  const { query, pagination, items, total } = usePagedQuery({
    name: "annotation_projects",
    func: api.tasks.getMany,
    pageSize,
    filter: filter.filter,
  });

  return {
    filter,
    query,
    pagination,
    items,
    total,
  };
}
