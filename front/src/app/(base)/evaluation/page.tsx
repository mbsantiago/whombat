"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import EvaluationSetList from "@/app/components/evaluation_sets/EvaluationSetList";

import Hero from "@/lib/components/ui/Hero";

import type { EvaluationSet } from "@/lib/types";

export default function Page() {
  const router = useRouter();

  const handleCreateOrClick = useCallback(
    (data: EvaluationSet) => {
      router.push(`/evaluation/detail/?evaluation_set_uuid=${data.uuid}`);
    },
    [router],
  );

  return (
    <>
      <Hero text="Evaluation Sets" />
      <EvaluationSetList
        onClickEvaluationSet={handleCreateOrClick}
        onCreateEvaluationSet={handleCreateOrClick}
      />
    </>
  );
}
