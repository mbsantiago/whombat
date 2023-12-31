"use client";
import { useContext, useMemo } from "react";

import ModelRunList from "@/components/model_runs/ModelRunList";

import EvaluationSetContext from "../context";

export default function Page() {
  const evaluationSet = useContext(EvaluationSetContext);
  const filter = useMemo(
    () => ({ evaluation_set: evaluationSet }),
    [evaluationSet],
  );
  return <ModelRunList filter={filter} />;
}
