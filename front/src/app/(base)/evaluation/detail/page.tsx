"use client";
import { useContext } from "react";

import { EvaluationSetContext } from "@/app/contexts";
import EvaluationSetDetail from "@/components/evaluation_sets/EvaluationSetDetail";

export default function Page() {
  const {
    evaluationSet,
    delete: delete_,
    update,
  } = useContext(EvaluationSetContext);

  return (
    <EvaluationSetDetail
      evaluationSet={evaluationSet}
      onChange={update}
      onDelete={delete_}
    />
  );
}
