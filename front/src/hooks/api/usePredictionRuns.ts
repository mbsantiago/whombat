import { type PredictionRunFilter } from "@/api/prediction_runs";
import api from "@/app/api";
import usePagedQuery from "@/hooks/api/usePagedQuery";
import useFilter from "@/hooks/api/useFilter";

const emptyFilter = {};

export default function usePredictionRuns({
  filter: initialFilter = emptyFilter,
  pageSize = 10,
}: {
  filter?: PredictionRunFilter;
  pageSize?: number;
} = {}) {
  const filter = useFilter<PredictionRunFilter>({
    fixed: initialFilter,
  });

  const { query, pagination, items, total } = usePagedQuery({
    name: "prediction_runs",
    func: api.prediction_runs.getMany,
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
