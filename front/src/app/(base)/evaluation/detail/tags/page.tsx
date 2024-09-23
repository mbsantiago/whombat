"use client";

import { useContext } from "react";

import EvaluationSetTags from "@/app/components/evaluation_sets/EvaluationSetTags";

import Center from "@/lib/components/layouts/Center";

import EvaluationSetContext from "../context";

export default function Page() {
  const evaluationSet = useContext(EvaluationSetContext);
  return (
    <Center>
      <div className="max-w-4xl">
        <EvaluationSetTags evaluationSet={evaluationSet} />
      </div>
    </Center>
  );
}
