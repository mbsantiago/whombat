import { type EvaluationSetFilter } from "@/api/evaluation_sets";
import api from "@/app/api";
import usePagedQuery from "@/hooks/api/usePagedQuery";
import useFilter from "@/hooks/api/useFilter";

const emptyFilter: EvaluationSetFilter = {};
const _fixed: (keyof EvaluationSetFilter)[] = [];

export default function useEvaluationSets({
  filter: initialFilter = emptyFilter,
  fixed = _fixed,
  pageSize = 10,
}: {
  filter?: EvaluationSetFilter;
  fixed?: (keyof EvaluationSetFilter)[];
  pageSize?: number;
} = {}) {
  const filter = useFilter<EvaluationSetFilter>({
    defaults: initialFilter,
    fixed,
  });

  const { query, pagination, items, total } = usePagedQuery({
    name: "evaluation_sets",
    func: api.evaluationSets.getMany,
    pageSize,
    filter: filter.filter,
  });

  return {
    ...query,
    items,
    filter,
    pagination,
    total,
  };
}
