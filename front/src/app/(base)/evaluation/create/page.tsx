"use client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { type EvaluationSetCreate as EvaluationSetCreateType } from "@/api/evaluation_sets";
import api from "@/app/api";
import EvaluationSetCreate from "@/components/evaluation_sets/EvaluationSetCreate";

export default function Page() {
  const router = useRouter();
  const { mutateAsync: create } = useMutation(api.evaluationSets.create);
  const onCreate = useMemo(() => {
    return async (evaluationSet: EvaluationSetCreateType) => {
      const created = await create(evaluationSet);
      router.push(`/evaluation/create/tags/?evaluation_set_id=${created.id}`);
      return created;
    };
  }, [create, router]);
  return <EvaluationSetCreate onCreate={onCreate} />;
}
