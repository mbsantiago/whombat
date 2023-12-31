import { type RecordingTagFilter } from "@/api/recordings";
import api from "@/app/api";
import usePagedQuery from "@/hooks/api/usePagedQuery";
import useFilter from "@/hooks/api/useFilter";

const emptyFilter = {};

export default function useRecordingTags({
  filter: initialFilter = emptyFilter,
  pageSize = 10,
}: {
  filter?: RecordingTagFilter;
  pageSize?: number;
} = {}) {
  const filter = useFilter<RecordingTagFilter>({ fixed: initialFilter });

  const { query, pagination, items, total } = usePagedQuery({
    name: "recording_tags",
    func: api.recordings.getTags,
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
