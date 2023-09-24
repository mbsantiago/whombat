import api from "@/app/api";
import usePagedQuery from "@/hooks/api/usePagedQuery";
import useFilter from "@/hooks/api/useFilter";
import { type TaskFilter } from "@/api/tasks";

const emptyFilter = {};

export default function useTasks({
  filter: initialFilter = emptyFilter,
  pageSize = 10,
}: {
  filter?: TaskFilter;
  pageSize?: number;
} = {}) {
  const filter = useFilter<TaskFilter>({
    fixed: initialFilter,
  });

  const { query, pagination, items, total } = usePagedQuery({
    name: "tasks",
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
