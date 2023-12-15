import { type RecordingFilter } from "@/api/recordings";
import usePagedQuery from "@/hooks/api/usePagedQuery";
import useFilter from "@/hooks/api/useFilter";
import api from "@/app/api";

const emptyFilter: RecordingFilter = {};
const _fixed: (keyof RecordingFilter)[] = [];

export default function useRecordings({
  filter: initialFilter = emptyFilter,
  fixed = _fixed,
  pageSize = 20,
}: {
  filter?: RecordingFilter;
  fixed?: (keyof RecordingFilter)[];
  pageSize?: number;
} = {}) {
  const filter = useFilter<RecordingFilter>({ defaults: initialFilter, fixed });

  const { items, total, pagination, query } = usePagedQuery({
    name: "dataset-recordings",
    func: api.recordings.getMany,
    pageSize: pageSize,
    filter: filter.filter,
  });

  return {
    items,
    total,
    pagination,
    query,
    filter,
  };
}
