import api from "@/app/api";

import useFilter from "@/lib/hooks/utils/useFilter";
import usePagedQuery from "@/lib/hooks/utils/usePagedQuery";

import { type ClipEvaluationFilter } from "@/lib/types";

const _empty: ClipEvaluationFilter = {};
const _fixed: (keyof ClipEvaluationFilter)[] = [];

export default function useClipEvaluations({
  filter: initialFilter = _empty,
  fixed = _fixed,
  pageSize = 10,
  enabled = true,
}: {
  filter?: ClipEvaluationFilter;
  fixed?: (keyof ClipEvaluationFilter)[];
  pageSize?: number;
  enabled?: boolean;
} = {}) {
  const filter = useFilter<ClipEvaluationFilter>({
    defaults: initialFilter,
    fixed,
  });

  const { query, pagination, items, total } = usePagedQuery({
    name: "clip_evaluations",
    queryFn: api.clipEvaluations.getMany,
    pageSize: pageSize,
    filter: filter.filter,
    enabled,
  });

  if (query.error != null) console.error(query.error);

  return {
    ...query,
    filter,
    pagination,
    items,
    total,
  } as const;
}
