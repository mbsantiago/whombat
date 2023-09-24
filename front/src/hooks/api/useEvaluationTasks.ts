import { type EvaluationTaskFilter } from "@/api/evaluation_tasks";
import api from "@/app/api";
import usePagedQuery from "@/hooks/api/usePagedQuery";
import useFilter from "@/hooks/api/useFilter";

const emptyFilter = {};

export default function useEvaluationTasks({
  filter: initialFilter = emptyFilter,
  pageSize = 10,
}: {
  filter?: EvaluationTaskFilter;
  pageSize?: number;
} = {}) {
  const filter = useFilter<EvaluationTaskFilter>({
    fixed: initialFilter,
  });

  const { query, pagination, items, total } = usePagedQuery({
    name: "evaluation_tasks",
    func: api.evaluation_tasks.getMany,
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
