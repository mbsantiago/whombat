"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type ReactNode } from "react";
import { toast } from "react-hot-toast";

import useEvaluationSet from "@/app/hooks/api/useEvaluationSet";

import EvaluationSetTabs from "@/app/(base)/evaluation/detail/components/EvaluationSetTabs";
import Loading from "@/app/loading";

import EvaluationSetContext from "./context";

export default function Layout({ children }: { children: ReactNode }) {
  const params = useSearchParams();
  const router = useRouter();

  const uuid = params.get("evaluation_set_uuid");

  const {
    isLoading,
    isError,
    data: evaluationSet,
  } = useEvaluationSet({
    uuid: uuid ?? "",
    enabled: uuid != null,
  });

  if (uuid == null) {
    toast.error("No evaluation set UUID provided.");
    router.push("/evaluation/");
  }

  if (isLoading) {
    return <Loading />;
  }

  if (isError || evaluationSet == null) {
    toast.error("Evaluation set not found.");
    router.push("/evaluation/");
    return;
  }

  return (
    <EvaluationSetContext.Provider value={evaluationSet}>
      <EvaluationSetTabs evaluationSet={evaluationSet} />
      <div className="p-4">{children}</div>
    </EvaluationSetContext.Provider>
  );
}
