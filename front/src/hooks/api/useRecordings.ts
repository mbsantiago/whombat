import api from "@/app/api";
import useFilter from "@/hooks/utils/useFilter";
import usePagedQuery from "@/hooks/utils/usePagedQuery";

import type { RecordingFilter } from "@/api/recordings";

const emptyFilter: RecordingFilter = {};
const _fixed: (keyof RecordingFilter)[] = [];

export default function useRecordings({
  filter: initialFilter = emptyFilter,
  fixed = _fixed,
  pageSize = 20,
  enabled = true,
}: {
  filter?: RecordingFilter;
  fixed?: (keyof RecordingFilter)[];
  pageSize?: number;
  enabled?: boolean;
} = {}) {
  const filter = useFilter<RecordingFilter>({ defaults: initialFilter, fixed });

  const { items, total, pagination, query, queryKey } = usePagedQuery({
    name: "dataset_recordings",
    queryFn: api.recordings.getMany,
    pageSize: pageSize,
    filter: filter.filter,
    enabled,
  });

  return {
    ...query,
    items,
    total,
    pagination,
    filter,
    queryKey,
  };
}
