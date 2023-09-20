import { type AnnotationTagFilter } from "@/api/annotations";
import api from "@/app/api";
import usePagedQuery from "@/hooks/api/usePagedQuery";
import useFilter from "@/hooks/api/useFilter";

export default function useAnnotationTags({
  filter: initialFilter = {},
  pageSize = 10,
}: {
  filter?: AnnotationTagFilter;
  pageSize?: number;
} = {}) {
  const filter = useFilter<AnnotationTagFilter>({ fixed: initialFilter });

  const { query, pagination, items, total } = usePagedQuery({
    name: "annotation_tags",
    func: api.annotations.getTags,
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
