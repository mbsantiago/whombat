import { type EvaluationSetFilter } from "@/api/evaluation_sets";
import api from "@/app/api";
import usePagedQuery from "@/hooks/api/usePagedQuery";
import useFilter from "@/hooks/api/useFilter";

const emptyFilter = {};

export default function useEvaluationSets({
  filter: initialFilter = emptyFilter,
  pageSize = 10,
}: {
  filter?: EvaluationSetFilter;
  pageSize?: number;
} = {}) {
  const filter = useFilter<EvaluationSetFilter>({
    fixed: initialFilter,
  });

  const { query, pagination, items, total } = usePagedQuery({
    name: "evaluation_sets",
    func: api.evaluation_sets.getMany,
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
