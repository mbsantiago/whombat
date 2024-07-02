import api from "@/app/api";
import useObject from "@/lib/hooks/utils/useObject";

import type { Evaluation } from "@/lib/types";
import type { AxiosError } from "axios";

export default function useEvaluation({
  uuid,
  evaluation,
  enabled = true,
  onDelete,
  onError,
}: {
  uuid?: string;
  evaluation?: Evaluation;
  enabled?: boolean;
  withState?: boolean;
  onDelete?: (deleted: Evaluation) => void;
  onError?: (error: AxiosError) => void;
}) {
  const { query, useDestruction } = useObject<Evaluation>({
    uuid,
    initial: evaluation,
    name: "evaluation",
    enabled,
    getFn: api.evaluations.get,
    onError,
  });

  const delete_ = useDestruction({
    mutationFn: api.evaluations.delete,
    onSuccess: onDelete,
  });

  return {
    ...query,
    delete: delete_,
  };
}
