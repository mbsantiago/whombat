import api from "@/app/api";

import useFilter from "@/lib/hooks/utils/useFilter";
import usePagedQuery from "@/lib/hooks/utils/usePagedQuery";

import type { NoteFilter } from "@/lib/types";

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
    queryFn: api.notes.getMany,
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
