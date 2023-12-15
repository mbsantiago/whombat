import api from "@/app/api";
import usePagedQuery from "@/hooks/api/usePagedQuery";
import useFilter from "@/hooks/api/useFilter";
import { type AnnotationTaskFilter } from "@/api/annotation_tasks";

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

  const { query, pagination, items, total } = usePagedQuery({
    name: "tasks",
    func: api.annotationTasks.getMany,
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
  };
}
