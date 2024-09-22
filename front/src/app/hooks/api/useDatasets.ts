import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import api from "@/app/api";

import useFilter from "@/lib/hooks/utils/useFilter";
import usePagedQuery from "@/lib/hooks/utils/usePagedQuery";

import type { Dataset, DatasetFilter } from "@/lib/types";

const _empty: DatasetFilter = {};
const _fixed: (keyof DatasetFilter)[] = [];

export default function useDatasets({
  filter: initialFilter = _empty,
  fixed = _fixed,
  pageSize = 10,
  enabled = true,
  onCreateDataset,
}: {
  filter?: DatasetFilter;
  fixed?: (keyof DatasetFilter)[];
  pageSize?: number;
  enabled?: boolean;
  onCreateDataset?: (dataset: Dataset) => void;
} = {}) {
  const filter = useFilter<DatasetFilter>({ defaults: initialFilter, fixed });

  const { query, pagination, items, total } = usePagedQuery({
    name: "datasets",
    queryFn: api.datasets.getMany,
    pageSize: pageSize,
    filter: filter.filter,
    enabled,
  });

  const create = useMutation({
    mutationFn: api.datasets.create,
    onSuccess: (data) => {
      toast.success(`Dataset ${data.name} created`);
      onCreateDataset?.(data);
      query.refetch();
    },
  });

  return {
    ...query,
    filter,
    pagination,
    items,
    total,
    create,
  } as const;
}
