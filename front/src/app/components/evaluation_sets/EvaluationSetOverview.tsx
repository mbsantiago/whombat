import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import useClipAnnotations from "@/app/hooks/api/useClipAnnotations";
import useModelRuns from "@/app/hooks/api/useModelRuns";
import useUserRuns from "@/app/hooks/api/useUserRuns";

import EvaluationSetOverviewBase from "@/lib/components/evaluation_sets/EvaluationSetOverview";

import type { EvaluationSet } from "@/lib/types";

export default function EvaluationSetOverview({
  evaluationSet,
}: {
  evaluationSet: EvaluationSet;
}) {
  const params = useSearchParams();
  const router = useRouter();

  const filter = useMemo(
    () => ({
      evaluation_set: evaluationSet,
    }),
    [evaluationSet],
  );

  const examples = useClipAnnotations({ filter, pageSize: 0 });
  const modelRuns = useModelRuns({ filter, pageSize: 0 });
  const userRuns = useUserRuns({ filter, pageSize: 0 });

  const handleClickAddTags = useCallback(() => {
    router.push(
      `/evaluation/detail/tags/?evaluation_set_uuid=${evaluationSet.uuid}&${params.toString()}`,
    );
  }, [evaluationSet.uuid, params, router]);

  const handleClickAddExamples = useCallback(() => {
    router.push(
      `/evaluation/detail/tasks/?evaluation_set_uuid=${evaluationSet.uuid}&${params.toString()}`,
    );
  }, [evaluationSet.uuid, params, router]);

  return (
    <EvaluationSetOverviewBase
      evaluationSet={evaluationSet}
      isLoading={
        examples.isLoading || modelRuns.isLoading || userRuns.isLoading
      }
      numModelRuns={modelRuns.total}
      numExamples={examples.total}
      numTrainingSessions={userRuns.total}
      onClickAddTags={handleClickAddTags}
      onClickAddExamples={handleClickAddExamples}
    />
  );
}
