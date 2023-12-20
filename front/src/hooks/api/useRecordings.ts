import { type RecordingFilter } from "@/api/recordings";
import usePagedQuery from "@/hooks/utils/usePagedQuery";
import useFilter from "@/hooks/utils/useFilter";
import api from "@/app/api";

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
