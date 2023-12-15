import { type NoteFilter } from "@/api/notes";
import api from "@/app/api";
import usePagedQuery from "@/hooks/api/usePagedQuery";
import useFilter from "@/hooks/api/useFilter";

const _empty: NoteFilter = {};
const _fixed: (keyof NoteFilter)[] = [];

export default function useNotes({
  filter: initialFilter = _empty,
  fixed = _fixed,
  pageSize = 10,
}: {
  filter?: NoteFilter;
  fixed?: (keyof NoteFilter)[];
  pageSize?: number;
} = {}) {
  const filter = useFilter<NoteFilter>({ defaults: initialFilter, fixed });

  const { query, pagination, items, total } = usePagedQuery({
    name: "notes",
    func: api.notes.getMany,
    pageSize: pageSize,
    filter: filter.filter,
  });

  return {
    ...query,
    filter,
    pagination,
    items,
    total,
  } as const;
}
