import api from "@/app/api";

import useFilter from "@/lib/hooks/utils/useFilter";
import usePagedQuery from "@/lib/hooks/utils/usePagedQuery";

import type { FeatureFilter } from "@/lib/types";

const _empty: FeatureFilter = {};
const _fixed: (keyof FeatureFilter)[] = [];

export default function useFeatures({
  filter: initialFilter = _empty,
  fixed = _fixed,
  pageSize = 20,
}: {
  filter?: FeatureFilter;
  fixed?: (keyof FeatureFilter)[];
  pageSize?: number;
} = {}) {
  const filter = useFilter<FeatureFilter>({ defaults: initialFilter, fixed });

  const { query, pagination, items, total } = usePagedQuery({
    name: "features",
    queryFn: api.datasets.getMany,
    pageSize: pageSize,
    filter: filter.filter,
  });

  return {
    ...query,
    filter,
    pagination,
    items,
    total,
  } as const;
}
