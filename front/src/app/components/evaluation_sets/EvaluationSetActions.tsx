import { useCallback } from "react";
import toast from "react-hot-toast";

import useEvaluationSet from "@/app/hooks/api/useEvaluationSet";

import api from "@/app/api";

import EvaluationSetActionsBase from "@/lib/components/evaluation_sets/EvaluationSetActions";

import type { EvaluationSet } from "@/lib/types";

export default function EvaluationSetActions({
  evaluationSet,
  onDelete,
  onDownload,
}: {
  evaluationSet: EvaluationSet;
  onDelete?: () => void;
  onDownload?: () => void;
}) {
  const { data, delete: deleteEvaluationSet } = useEvaluationSet({
    uuid: evaluationSet.uuid,
    evaluationSet,
    onDelete,
  });

  const handleDownload = useCallback(async () => {
    (await toast.promise(api.evaluationSets.download(evaluationSet.uuid), {
      loading: "Preparing download, please wait...",
      success: "Downloaded!",
      error: "Failed to download",
    }),
      onDownload?.());
  }, [onDownload, evaluationSet.uuid]);

  const handleDelete = useCallback(async () => {
    await toast.promise(deleteEvaluationSet.mutateAsync(), {
      loading: "Deleting evaluation set, please wait...",
      success: "Deleted!",
      error: "Failed to delete",
    });
    onDelete?.();
  }, [onDelete, deleteEvaluationSet]);

  return (
    <EvaluationSetActionsBase
      evaluationSet={data || evaluationSet}
      onDelete={handleDelete}
      onDownload={handleDownload}
    />
  );
}
