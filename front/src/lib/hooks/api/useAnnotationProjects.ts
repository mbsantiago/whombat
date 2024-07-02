import { type AnnotationProjectFilter } from "@/lib/api/annotation_projects";
import api from "@/app/api";
import useFilter from "@/lib/hooks/utils/useFilter";
import usePagedQuery from "@/lib/hooks/utils/usePagedQuery";

const emptyFilter: AnnotationProjectFilter = {};
const _fixed: (keyof AnnotationProjectFilter)[] = [];

export default function useAnnotationProjects({
  filter: initialFilter = emptyFilter,
  fixed = _fixed,
  pageSize = 10,
}: {
  filter?: AnnotationProjectFilter;
  fixed?: (keyof AnnotationProjectFilter)[];
  pageSize?: number;
} = {}) {
  const filter = useFilter<AnnotationProjectFilter>({
    defaults: initialFilter,
    fixed,
  });

  const { query, pagination, items, total } = usePagedQuery({
    name: "annotation_projects",
    queryFn: api.annotationProjects.getMany,
    pageSize,
    filter: filter.filter,
  });

  return {
    ...query,
    items,
    filter,
    pagination,
    total,
  } as const;
}