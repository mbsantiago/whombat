import { type DatasetFilter } from "@/api/datasets";
import api from "@/app/api";
import usePagedQuery from "@/hooks/api/usePagedQuery";
import useFilter from "@/hooks/api/useFilter";

export default function useDatasets({
  filter: initialFilter = {},
  pageSize = 10,
}: {
  filter?: DatasetFilter;
  pageSize?: number;
} = {}) {
  const filter = useFilter<DatasetFilter>({ fixed: initialFilter });

  const { query, pagination, items, total } = usePagedQuery({
    name: "datasets",
    func: api.datasets.getMany,
    pageSize: pageSize,
    filter: filter.filter,
  });

  return {
    query,
    filter,
    pagination,
    items,
    total,
  };
}
