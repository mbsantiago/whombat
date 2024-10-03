import api from "@/app/api";

import useFilter from "@/lib/hooks/utils/useFilter";
import usePagedQuery from "@/lib/hooks/utils/usePagedQuery";

import type { AnnotationTaskFilter } from "@/lib/types";

const emptyFilter: AnnotationTaskFilter = {};
const _fixed: (keyof AnnotationTaskFilter)[] = [];

export default function useAnnotationTasks({
  filter: initialFilter = emptyFilter,
  fixed = _fixed,
  pageSize = 10,
  enabled = true,
}: {
  filter?: AnnotationTaskFilter;
  fixed?: (keyof AnnotationTaskFilter)[];
  pageSize?: number;
  enabled?: boolean;
} = {}) {
  const filter = useFilter<AnnotationTaskFilter>({
    defaults: initialFilter,
    fixed,
  });

  const { query, pagination, items, total, queryKey } = usePagedQuery({
    name: "annotation_tasks",
    queryFn: api.annotationTasks.getMany,
    pageSize,
    filter: filter.filter,
    enabled,
  });

  return {
    ...query,
    items,
    filter,
    pagination,
    total,
    queryKey,
  };
}
