import { type TaskFilter } from "@/api/tasks";
import { type Task, type TaskCreate } from "@/api/tasks";
import api from "@/app/api";
import { useMutation } from "@tanstack/react-query";
import usePagedQuery from "@/hooks/usePagedQuery";
import useFilter from "@/hooks/useFilter";

export default function useTasks({
  filter: initialFilter = {},
  pageSize = 10,
  onCreateMany,
}: {
  filter?: TaskFilter;
  pageSize?: number;
  onCreateMany?: (tasks: Task[]) => void;
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

  const createMany = useMutation({
    mutationFn: async (data: TaskCreate[]) => {
      return await api.tasks.createMany(data);
    },
    onSuccess: (created) => {
      query.refetch();
      onCreateMany?.(created);
    },
  });

  return {
    createMany,
    filter,
    query,
    pagination,
    items,
    total,
  };
}
