"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useContext } from "react";
import toast from "react-hot-toast";

import EvaluationSetModelRuns from "@/components/evaluation_sets/EvaluationSetModelRuns";

import EvaluationSetContext from "../context";

import type { ModelRun } from "@/types";

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
