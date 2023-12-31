"use client";
import { useRouter } from "next/navigation";
import { useCallback, useContext } from "react";
import toast from "react-hot-toast";

import EvaluationSetDetail from "@/components/evaluation_sets/EvaluationSetDetail";

import EvaluationSetContext from "./context";

export default function Page() {
  const router = useRouter();
  const evaluationSet = useContext(EvaluationSetContext);

  const handleDelete = useCallback(() => {
    toast.success("Evaluation set deleted");
    router.push("/evaluation/");
  }, [router]);

  return (
    <EvaluationSetDetail
      evaluationSet={evaluationSet}
      onDelete={handleDelete}
    />
  );
}
