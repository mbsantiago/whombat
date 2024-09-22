import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import api from "@/app/api";

import useFilter from "@/lib/hooks/utils/useFilter";
import usePagedQuery from "@/lib/hooks/utils/usePagedQuery";

import type { AnnotationProject, AnnotationProjectFilter } from "@/lib/types";

const emptyFilter: AnnotationProjectFilter = {};
const _fixed: (keyof AnnotationProjectFilter)[] = [];

export default function useAnnotationProjects({
  filter: initialFilter = emptyFilter,
  fixed = _fixed,
  pageSize = 10,
  onCreateAnnotationProject,
}: {
  filter?: AnnotationProjectFilter;
  fixed?: (keyof AnnotationProjectFilter)[];
  pageSize?: number;
  onCreateAnnotationProject?: (annotationProject: AnnotationProject) => void;
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

  const create = useMutation({
    mutationFn: api.annotationProjects.create,
    onSuccess: (data) => {
      toast.success(`Annotation project ${data.name} created`);
      onCreateAnnotationProject?.(data);
      query.refetch();
    },
  });

  return {
    ...query,
    items,
    filter,
    pagination,
    total,
    create,
  } as const;
}
