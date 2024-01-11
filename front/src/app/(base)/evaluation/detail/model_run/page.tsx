"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useContext } from "react";
import toast from "react-hot-toast";

import Loading from "@/components/Loading";
import ModelRunDetail from "@/components/model_runs/ModelRunDetail";
import useModelRun from "@/hooks/api/useModelRun";
import EvaluationSetContext from "../context";

import type { AxiosError } from "axios";
import type { ModelRun, Evaluation } from "@/types";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modelRunUUID = searchParams.get("model_run_uuid");
  const evaluationSetUUID = searchParams.get("evaluation_set_uuid");
  const evaluationSet = useContext(EvaluationSetContext);

  const returnToModelRuns = useCallback(() => {
    if (evaluationSetUUID == null) router.push("/evaluation/");
    router.push(
      `/evaluation/detail/model_runs/?evaluation_set_uuid=${evaluationSetUUID}`,
    );
  }, [router, evaluationSetUUID]);

  const handleError = useCallback(
    (error: AxiosError) => {
      if (error.response?.status === 404) {
        toast.error("Model run not found");
        returnToModelRuns();
      }
    },
    [returnToModelRuns],
  );

  const onDelete = useCallback(
    (modelRun: Promise<ModelRun>) => {
      toast.promise(modelRun, {
        loading: "Deleting model run...",
        success: "Model run deleted",
        error: "Failed to delete model run",
      });

      modelRun.then(() => {
        returnToModelRuns();
      });
    },
    [returnToModelRuns],
  );

  const handleEvaluate = useCallback((promise: Promise<Evaluation>) => {
    toast.promise(promise, {
      loading: "Evaluating the model run. Please wait...",
      success: "Model run evaluated!",
      error: "Failed to evaluate the model run.",
    });
  }, []);

  const modelRun = useModelRun({
    uuid: modelRunUUID || undefined,
    onError: handleError,
  });

  if (modelRun.isLoading) return <Loading />;

  if (modelRun.isError || modelRun.data == null) {
    return handleError(modelRun.error as AxiosError);
  }

  return (
    <ModelRunDetail
      modelRun={modelRun.data}
      onDelete={onDelete}
      evaluationSet={evaluationSet}
      onEvaluate={handleEvaluate}
    />
  );
}
