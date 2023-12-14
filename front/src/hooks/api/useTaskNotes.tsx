import { type TaskNoteFilter } from "@/api/tasks";
import api from "@/app/api";
import usePagedQuery from "@/hooks/api/usePagedQuery";
import useFilter from "@/hooks/api/useFilter";

const emptyFilter = {};

export default function useTaskNotes({
  filter: initialFilter = emptyFilter,
  pageSize = 10,
}: {
  filter?: TaskNoteFilter;
  pageSize?: number;
} = {}) {
  const filter = useFilter<TaskNoteFilter>({ fixed: initialFilter });

  const { query, pagination, items, total } = usePagedQuery({
    name: "task_notes",
    func: api.annotation_tasks.getNotes,
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
