import { type AnnotationProjectFilter } from "@/api/annotation_projects";
import api from "@/app/api";
import usePagedQuery from "@/hooks/usePagedQuery";
import useFilter from "@/hooks/useFilter";

export default function useAnnotationProjects({
  filter: initialFilter = {},
  pageSize = 10,
}: {
  filter?: AnnotationProjectFilter;
  pageSize?: number;
} = {}) {
  const filter = useFilter<AnnotationProjectFilter>({
    fixed: initialFilter,
  });

  const { query, pagination, items, total } = usePagedQuery({
    name: "annotation_projects",
    func: api.annotation_projects.getMany,
    pageSize,
    filter: filter.filter,
  });

  return {
    filter,
    query,
    pagination,
    items,
    total,
  };
}
