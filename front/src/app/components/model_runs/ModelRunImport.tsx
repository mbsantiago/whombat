import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import toast from "react-hot-toast";

import api from "@/app/api";

import ModelRunImportBase from "@/lib/components/model_runs/ModelRunImport";

import type { EvaluationSet, ModelRun, ModelRunImport } from "@/lib/types";

export default function ModelRunImport({
  onCreate,
  evaluationSet,
}: {
  onCreate?: (data: ModelRun) => void;
  evaluationSet: EvaluationSet;
}) {
  const { mutateAsync } = useMutation({
    mutationFn: api.modelRuns.import,
    onSuccess: onCreate,
  });

  const handleImport = useCallback(
    async (data: ModelRunImport) => {
      await toast.promise(mutateAsync(data), {
        loading: "Importing model run...",
        success: "Model run imported",
        error: "Failed to import model run",
      });
    },
    [mutateAsync],
  );

  return (
    <ModelRunImportBase
      evaluationSet={evaluationSet}
      onImportModelRun={handleImport}
    />
  );
}
