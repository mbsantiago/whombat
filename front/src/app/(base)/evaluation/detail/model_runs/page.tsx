"use client";

import EvaluationSetModelRuns from "@/lib/components/evaluation_sets/EvaluationSetModelRuns";
import type { ModelRun } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useContext } from "react";
import toast from "react-hot-toast";

import EvaluationSetContext from "../context";

export default function Page() {
  const router = useRouter();
  const params = useSearchParams();
  const evaluationSet = useContext(EvaluationSetContext);

  const isImport = params.get("import") === "true";

  const handleCreate = useCallback(
    (promise: Promise<ModelRun>) => {
      toast.promise(promise, {
        loading: "Creating the model run. Please wait...",
        success: "Model run Created!",
        error: "Failed to create the model run.)",
      });
      promise.then((data) => {
        router.push(
          `/evaluation/detail/model_run/?model_run_uuid=${data.uuid}&evaluation_set_uuid=${evaluationSet.uuid}`,
        );
      });
    },
    [router, evaluationSet.uuid],
  );

  return (
    <EvaluationSetModelRuns
      evaluationSet={evaluationSet}
      openImport={isImport}
      onCreate={handleCreate}
    />
  );
}
