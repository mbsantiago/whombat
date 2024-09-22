"use client";

import { useRouter } from "next/navigation";
import { useCallback, useContext } from "react";

import EvaluationSetDetail from "@/app/components/evaluation_sets/EvaluationSetDetail";

import EvaluationSetContext from "./context";

export default function Page() {
  const router = useRouter();
  const evaluationSet = useContext(EvaluationSetContext);

  const handleDelete = useCallback(() => {
    router.push("/evaluation/");
  }, [router]);

  return (
    <EvaluationSetDetail
      evaluationSet={evaluationSet}
      onDelete={handleDelete}
    />
  );
}
