import { useMutation } from "@tanstack/react-query";

import {
  type EvaluationTaskFilter,
  EvaluationTask,
} from "@/api/evaluation_tasks";
import api from "@/app/api";
import usePagedQuery from "@/hooks/api/usePagedQuery";
import useFilter from "@/hooks/api/useFilter";

const emptyFilter = {};

export default function useEvaluationTasks({
  filter: initialFilter = emptyFilter,
  pageSize = 10,
  enabled = true,
  onCreate,
}: {
  filter?: EvaluationTaskFilter;
  pageSize?: number;
  enabled?: boolean;
  onCreate?: (created: EvaluationTask[]) => void;
} = {}) {
  const filter = useFilter<EvaluationTaskFilter>({
    fixed: initialFilter,
  });

  const { query, pagination, items, total } = usePagedQuery({
    name: "evaluation_tasks",
    func: api.evaluation_tasks.getMany,
    pageSize,
    filter: filter.filter,
    enabled,
  });

  const create = useMutation({
    mutationFn: api.evaluation_tasks.createMany,
    onSuccess: (created: EvaluationTask[]) => {
      query.refetch();
      onCreate?.(created);
    },
  });

  return {
    filter,
    query,
    pagination,
    items,
    total,
    create,
  };
}
