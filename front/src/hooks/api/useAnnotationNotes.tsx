import { type AnnotationNoteFilter } from "@/api/annotations";
import api from "@/app/api";
import usePagedQuery from "@/hooks/api/usePagedQuery";
import useFilter from "@/hooks/api/useFilter";

export default function useAnnotationNotes({
  filter: initialFilter = {},
  pageSize = 10,
}: {
  filter?: AnnotationNoteFilter;
  pageSize?: number;
} = {}) {
  const filter = useFilter<AnnotationNoteFilter>({ fixed: initialFilter });

  const { query, pagination, items, total } = usePagedQuery({
    name: "annotation_notes",
    func: api.annotations.getNotes,
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
