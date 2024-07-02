import { type ClipPredictionFilter } from "@/lib/api/clip_predictions";
import api from "@/app/api";
import useFilter from "@/hooks/utils/useFilter";
import usePagedQuery from "@/hooks/utils/usePagedQuery";

const _empty: ClipPredictionFilter = {};
const _fixed: (keyof ClipPredictionFilter)[] = [];

export default function useClipPredictions({
  filter: initialFilter = _empty,
  fixed = _fixed,
  pageSize = 10,
  enabled = true,
}: {
  filter?: ClipPredictionFilter;
  fixed?: (keyof ClipPredictionFilter)[];
  pageSize?: number;
  enabled?: boolean;
} = {}) {
  const filter = useFilter<ClipPredictionFilter>({
    defaults: initialFilter,
    fixed,
  });

  const { query, pagination, items, total } = usePagedQuery({
    name: "clip_predictions",
    queryFn: api.clipPredictions.getMany,
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
