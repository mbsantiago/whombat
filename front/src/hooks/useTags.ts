import api from "@/app/api";
import usePagedQuery from "@/hooks/usePagedQuery";
import useFilter from "@/hooks/useFilter";
import { useMutation } from "@tanstack/react-query";
import { type TagFilter } from "@/api/tags";

export default function useTags({
  initialFilter = {},
}: {
  initialFilter?: TagFilter;
} = {}) {
  const filter = useFilter<TagFilter>({
    initialState: initialFilter,
    debounce: 50, // Lower debounce time for faster response
  });

  const query = usePagedQuery({
    name: "tags",
    func: api.tags.get,
    pageSize: 10,
    filter: filter.filter,
  });

  const mutation = useMutation({
    mutationFn: api.tags.create,
    onSuccess: () => {
      query.refetch();
    },
  });

  return {
    results: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    filter,
    query,
    mutation,
  };
}
