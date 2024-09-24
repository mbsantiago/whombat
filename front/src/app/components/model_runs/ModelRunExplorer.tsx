import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import ClipEvaluationSpectrogram from "@/app/components/clip_evaluation/ClipEvaluationSpectrogram";

import useClipEvaluations from "@/app/hooks/api/useClipEvaluations";

import api from "@/app/api";

import ClipEvaluationDisplay from "@/lib/components/clip_evaluations/ClipEvaluationDisplay";
import ClipEvaluationExplorer, {
  FilterControls,
} from "@/lib/components/clip_evaluations/ClipEvaluationExplorer";
import NavigationControls from "@/lib/components/lists/Navigation";
import { Empty, Loading } from "@/lib/components/ui";

import useExplorationSettings from "@/lib/hooks/evaluation/useExplorationSettings";
import useListSelection from "@/lib/hooks/lists/useListSelection";

import type {
  ClipEvaluation,
  ClipEvaluationFilter,
  Evaluation,
  EvaluationSet,
  ModelRun,
} from "@/lib/types";

export default function ModelRunExplorer({
  modelRun,
  evaluationSet,
}: {
  modelRun: ModelRun;
  evaluationSet: EvaluationSet;
}) {
  const {
    data: evaluation,
    isLoading: isLoadingEvaluation,
    isError,
  } = useQuery({
    queryKey: [
      "evaluation",
      "model_run",
      modelRun,
      "evaluation_set",
      evaluationSet,
    ],
    retry: false,
    queryFn: () => api.modelRuns.getEvaluation(modelRun, evaluationSet),
  });

  if (isLoadingEvaluation) {
    return <Loading />;
  }

  if (isError || evaluation == null) {
    return <Empty>No evaluation</Empty>;
  }

  return <Inner evaluation={evaluation} />;
}

function Inner({ evaluation }: { evaluation: Evaluation }) {
  const filter: ClipEvaluationFilter = useMemo(
    () => ({
      evaluation,
    }),
    [evaluation],
  );

  const { items, total, isLoading, pagination } = useClipEvaluations({
    pageSize: 10,
    filter,
    fixed: ["evaluation"],
  });

  const selection = useListSelection({
    items,
    total,
    pagination,
  });

  const settings = useExplorationSettings();

  return (
    <ClipEvaluationExplorer
      NavigationControls={
        <NavigationControls
          index={selection.index}
          total={total}
          hasNext={selection.hasNext}
          hasPrev={selection.hasPrev}
          onNext={selection.next}
          onPrev={selection.prev}
          onRandom={selection.random}
        />
      }
      FilterControls={
        <FilterControls
          threshold={settings.threshold}
          onThresholdChange={settings.setThreshold}
          showPredictions={settings.showPredictions}
          onToggleAnnotations={settings.toggleAnnotations}
          showAnnotations={settings.showAnnotations}
          onTogglePredictions={settings.togglePredictions}
        />
      }
      ClipEvaluation={
        selection.current == null ? undefined : (
          <ClipEvaluationDisplay
            clipEvaluation={selection.current}
            threshold={settings.threshold}
            ClipEvaluationSpectrogram={Spectrogram}
          />
        )
      }
      isLoading={isLoading}
      isEmpty={total === 0}
    />
  );
}

function Spectrogram(props: {
  clipEvaluation: ClipEvaluation;
  threshold?: number;
  showAnnotations?: boolean;
  showPredictions?: boolean;
}) {
  return (
    <ClipEvaluationSpectrogram
      clipEvaluation={props.clipEvaluation}
      height={400}
      withViewportBar={false}
    />
  );
}
