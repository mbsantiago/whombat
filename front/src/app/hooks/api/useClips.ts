import { useMutation } from "@tanstack/react-query";

import api from "@/app/api";

import useFilter from "@/lib/hooks/utils/useFilter";
import usePagedQuery from "@/lib/hooks/utils/usePagedQuery";

import type { ClipFilter } from "@/lib/types";

const _empty: ClipFilter = {};
const _fixed: (keyof ClipFilter)[] = [];

export default function useClips({
  filter: initialFilter = _empty,
  fixed = _fixed,
  pageSize = 10,
  enabled = true,
}: {
  filter?: ClipFilter;
  fixed?: (keyof ClipFilter)[];
  pageSize?: number;
  enabled?: boolean;
} = {}) {
  const filter = useFilter<ClipFilter>({ defaults: initialFilter, fixed });

  const { query, pagination, items, total } = usePagedQuery({
    name: "clips",
    queryFn: api.clips.getMany,
    pageSize: pageSize,
    filter: filter.filter,
    enabled,
  });

  const createMany = useMutation({
    mutationFn: api.clips.createMany,
    onSuccess: () => {
      query.refetch();
    },
  });

  return {
    ...query,
    filter,
    pagination,
    items,
    total,
    createMany,
  } as const;
}
