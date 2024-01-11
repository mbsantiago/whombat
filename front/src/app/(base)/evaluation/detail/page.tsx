"use client";
import { useRouter } from "next/navigation";
import { useCallback, useContext } from "react";
import toast from "react-hot-toast";

import EvaluationSetDetail from "@/components/evaluation_sets/EvaluationSetDetail";

import EvaluationSetContext from "./context";

import type { EvaluationSet } from "@/types";

export default function Page() {
  const router = useRouter();
  const evaluationSet = useContext(EvaluationSetContext);

  const handleDelete = useCallback(
    (data: Promise<EvaluationSet>) => {
      toast.promise(data, {
        loading: "Deleting evaluation set...",
        success: "Evaluation set deleted",
        error: "Failed to delete evaluation set",
      });
      data.then(() => router.push("/evaluation/"));
    },
    [router],
  );

  return (
    <EvaluationSetDetail
      evaluationSet={evaluationSet}
      onDelete={handleDelete}
    />
  );
}
