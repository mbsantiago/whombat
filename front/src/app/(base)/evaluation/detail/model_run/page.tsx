"use client";

import type { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useContext } from "react";
import toast from "react-hot-toast";

import ModelRunActions from "@/app/components/model_runs/ModelRunActions";
import ModelRunEvaluation from "@/app/components/model_runs/ModelRunEvaluations";
import ModelRunExplorer from "@/app/components/model_runs/ModelRunExplorer";
import ModelRunUpdate from "@/app/components/model_runs/ModelRunUpdate";

import useModelRun from "@/app/hooks/api/useModelRun";

import DetailLayout from "@/lib/components/layouts/Detail";
import Loading from "@/lib/components/ui/Loading";

import EvaluationSetContext from "../context";

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

  const handleEvaluate = useCallback(() => {
    router.refresh();
  }, [router]);

  const modelRun = useModelRun({
    uuid: modelRunUUID ?? "",
    onError: handleError,
    enabled: modelRunUUID != null,
  });

  if (modelRun.isLoading) return <Loading />;

  if (modelRun.isError || modelRun.data == null) {
    return handleError(modelRun.error as AxiosError);
  }

  return (
    <DetailLayout
      SideBar={<ModelRunUpdate modelRun={modelRun.data} />}
      Actions={
        <ModelRunActions
          modelRun={modelRun.data}
          onDeleteModelRun={returnToModelRuns}
        />
      }
      MainContent={
        <div className="flex flex-col gap-4">
          <ModelRunEvaluation
            modelRun={modelRun.data}
            evaluationSet={evaluationSet}
            onEvaluate={handleEvaluate}
          />
          <ModelRunExplorer
            modelRun={modelRun.data}
            evaluationSet={evaluationSet}
          />
        </div>
      }
    />
  );
}
