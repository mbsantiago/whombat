"use client";
import { useContext, useMemo } from "react";
import { useRouter } from "next/navigation";

import { type EvaluationSetCreate as EvaluationSetCreateType } from "@/api/evaluation_sets";
import EvaluationSetCreate from "@/components/evaluation_sets/EvaluationSetCreate";
import { EvaluationSetContext } from "@/app/contexts";

export default function Page() {
  const router = useRouter();
  const { create } = useContext(EvaluationSetContext);

  const onCreate = useMemo(() => {
    if (create == null) {
      return undefined;
    }
    return async (evaluationSet: EvaluationSetCreateType) => {
      const created = await create(evaluationSet);
      router.push(`/evaluation/create/tags/?evaluation_set_id=${created.id}`);
      return created;
    };
  }, [create, router]);

  return <EvaluationSetCreate onCreate={onCreate} />;
}
