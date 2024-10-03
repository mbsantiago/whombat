import api from "@/app/api";

import useFilter from "@/lib/hooks/utils/useFilter";
import usePagedQuery from "@/lib/hooks/utils/usePagedQuery";

import { type ModelRunFilter } from "@/lib/types";

const _empty: ModelRunFilter = {};
const _fixed: (keyof ModelRunFilter)[] = [];

export default function useModelRuns({
  filter: initialFilter = _empty,
  fixed = _fixed,
  pageSize = 10,
  enabled = true,
}: {
  filter?: ModelRunFilter;
  fixed?: (keyof ModelRunFilter)[];
  pageSize?: number;
  enabled?: boolean;
} = {}) {
  const filter = useFilter<ModelRunFilter>({ defaults: initialFilter, fixed });

  const { query, pagination, items, total } = usePagedQuery({
    name: "model_runs",
    queryFn: api.modelRuns.getMany,
    pageSize: pageSize,
    filter: filter.filter,
    enabled,
  });

  return {
    ...query,
    filter,
    pagination,
    items,
    total,
  } as const;
}
