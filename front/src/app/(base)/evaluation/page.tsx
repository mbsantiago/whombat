"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import toast from "react-hot-toast";

import EvaluationSetList from "@/components/evaluation/EvaluationSetList";
import Hero from "@/components/Hero";

import type { EvaluationSet } from "@/types";

export default function Page() {
  const router = useRouter();

  const handleCreate = useCallback(
    (evaluationSet: EvaluationSet) => {
      toast.success("Evaluation set created successfully.");
      router.push(
        `/evaluation/detail/?evaluation_set_uuid=${evaluationSet.uuid}`,
      );
    },
    [router],
  );

  return (
    <>
      <Hero text="Evaluation Sets" />
      <EvaluationSetList onCreate={handleCreate} />
    </>
  );
}
