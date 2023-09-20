import { type RecordingNoteFilter } from "@/api/recordings";
import api from "@/app/api";
import usePagedQuery from "@/hooks/api/usePagedQuery";
import useFilter from "@/hooks/api/useFilter";

export default function useRecordingNotes({
  filter: initialFilter = {},
  pageSize = 10,
}: {
  filter?: RecordingNoteFilter;
  pageSize?: number;
} = {}) {
  const filter = useFilter<RecordingNoteFilter>({ fixed: initialFilter });

  const { query, pagination, items, total } = usePagedQuery({
    name: "recording_notes",
    func: api.recordings.getNotes,
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
