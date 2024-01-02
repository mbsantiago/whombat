"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import toast from "react-hot-toast";

import EvaluationSetList from "@/components/evaluation_sets/EvaluationSetList";
import Hero from "@/components/Hero";

import type { EvaluationSet } from "@/types";

export default function Page() {
  const router = useRouter();

  const handleCreate = useCallback(
    (evaluationSet: Promise<EvaluationSet>) => {
      toast.promise(evaluationSet, {
        loading:
          "Creating evaluation set... This can take a while when importing a large file.",
        success: "Evaluation set created!",
        error: "Failed to create evaluation set.",
      });

      evaluationSet.then((data) =>
        router.push(`/evaluation/detail/?evaluation_set_uuid=${data.uuid}`),
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
