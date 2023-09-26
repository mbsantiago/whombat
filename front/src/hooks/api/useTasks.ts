import api from "@/app/api";
import usePagedQuery from "@/hooks/api/usePagedQuery";
import useFilter from "@/hooks/api/useFilter";
import { type TaskFilter } from "@/api/tasks";

const emptyFilter = {};

export default function useTasks({
  filter: initialFilter = emptyFilter,
  pageSize = 10,
  enabled = true,
}: {
  filter?: TaskFilter;
  pageSize?: number;
  enabled?: boolean;
} = {}) {
  const filter = useFilter<TaskFilter>({
    fixed: initialFilter,
  });

  const { query, pagination, items, total } = usePagedQuery({
    name: "tasks",
    func: api.tasks.getMany,
    pageSize,
    filter: filter.filter,
    enabled,
  });

  return {
    filter,
    query,
    pagination,
    items,
    total,
  };
}
