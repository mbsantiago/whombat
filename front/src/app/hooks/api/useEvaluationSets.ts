import api from "@/app/api";

import useFilter from "@/lib/hooks/utils/useFilter";
import usePagedQuery from "@/lib/hooks/utils/usePagedQuery";

import type { EvaluationSetFilter } from "@/lib/types";

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
    queryFn: api.evaluationSets.getMany,
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
