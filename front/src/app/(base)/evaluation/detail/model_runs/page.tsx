"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useContext, useMemo } from "react";
import toast from "react-hot-toast";

import ModelRunList from "@/components/model_runs/ModelRunList";

import EvaluationSetContext from "../context";

import type { ModelRun } from "@/types";

export default function Page() {
  const router = useRouter();
  const params = useSearchParams();
  const evaluationSet = useContext(EvaluationSetContext);

  const isImport = params.get("import") === "true";

  const handleCreate = useCallback(
    (modelRun: Promise<ModelRun>) => {
      toast.promise(modelRun, {
        loading: "Creating the model run. Please wait...",
        success: "Model run Created!",
        error: "Failed to create the model run.)",
      });

      modelRun.then((data) => {
        router.push(
          `/evaluation/detail/model_run/?model_run_uuid=${data.uuid}&evaluation_set_uuid=${evaluationSet.uuid}`,
        );
      });
    },
    [router, evaluationSet.uuid],
  );

  const filter = useMemo(
    () => ({ evaluation_set: evaluationSet }),
    [evaluationSet],
  );
  return (
    <ModelRunList
      filter={filter}
      openImport={isImport}
      onCreate={handleCreate}
    />
  );
}
