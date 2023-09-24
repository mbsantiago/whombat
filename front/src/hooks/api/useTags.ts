import { useMutation } from "@tanstack/react-query";

import api from "@/app/api";
import usePagedQuery from "@/hooks/api/usePagedQuery";
import useFilter from "@/hooks/api/useFilter";
import { type TagFilter } from "@/api/tags";

const emptyFilter = {};

export default function useTags({
  initialFilter = emptyFilter,
  pageSize = 10,
}: {
  initialFilter?: TagFilter;
  pageSize?: number;
} = {}) {
  const filter = useFilter<TagFilter>({
    fixed: initialFilter,
    debounce: 50, // Lower debounce time for faster response
  });

  const { items, total, query, pagination } = usePagedQuery({
    name: "tags",
    func: api.tags.get,
    pageSize: pageSize,
    filter: filter.filter,
  });

  const create = useMutation({
    mutationFn: api.tags.create,
    onSuccess: () => {
      query.refetch();
    },
  });

  return {
    items,
    total,
    query,
    pagination,
    filter,
    create,
  };
}
