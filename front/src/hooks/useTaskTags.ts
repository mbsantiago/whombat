import { type TaskTagFilter } from "@/api/tasks";
import api from "@/app/api";
import usePagedQuery from "@/hooks/usePagedQuery";
import useFilter from "@/hooks/useFilter";

export default function useTaskTags({
  filter: initialFilter = {},
  pageSize = 10,
}: {
  filter?: TaskTagFilter;
  pageSize?: number;
} = {}) {
  const filter = useFilter<TaskTagFilter>({ fixed: initialFilter });

  const { query, pagination, items, total } = usePagedQuery({
    name: "task_tags",
    func: api.tasks.getTags,
    pageSize: pageSize,
    filter: filter.filter,
  });

  return {
    query,
    filter,
    pagination,
    items,
    total,
  };
}
