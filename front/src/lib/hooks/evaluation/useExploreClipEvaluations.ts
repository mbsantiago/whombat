import { useCallback, useMemo, useState } from "react";

import useClipEvaluations from "@/app/hooks/api/useClipEvaluations";

import type { ClipEvaluationFilter } from "@/lib/api/clip_evaluations";
import type { Filter } from "@/lib/hooks/utils/useFilter";
import type { ClipEvaluation, Interval } from "@/lib/types";

type ExplorationState = {
  filter: Filter<ClipEvaluationFilter>;
  clipEvaluation: ClipEvaluation | null;
  isLoading: boolean;
  isError: boolean;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
  showAnnotations: boolean;
  showPredictions: boolean;
  threshold: Interval;
  index: number | null;
};

type ExplorationControls = {
  next: () => void;
  prev: () => void;
  random: () => void;
  toggleAnnotations: () => void;
  togglePredictions: () => void;
  setThreshold: (threshold: Interval) => void;
};

const DEFAULT_THRESHOLD: Interval = { min: 0.5, max: 1 };

export default function useExploreClipEvaluations(props: {
  clipEvaluation?: ClipEvaluation;
  filter?: ClipEvaluationFilter;
  threshold?: Interval;
}): ExplorationState & ExplorationControls {
  const [index, setIndex] = useState<number | null>(
    props.clipEvaluation == null ? 0 : null,
  );
  const [threshold, setThreshold] = useState<Interval>(
    props.threshold ?? DEFAULT_THRESHOLD,
  );
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [showPredictions, setShowPredictions] = useState<boolean>(true);

  const {
    items,
    total,
    filter,
    isLoading,
    isError,
    pagination: { setPage, pageSize, page },
  } = useClipEvaluations({
    pageSize: 10,
    filter: props.filter,
    fixed: Object.keys(props.filter ?? {}) as (keyof ClipEvaluationFilter)[],
  });

  const globalIndex = useMemo(() => {
    if (isLoading) return null;
    if (index == null) return null;
    return index + page * pageSize;
  }, [isLoading, index, page, pageSize]);

  const hasNext = useMemo(() => {
    if (globalIndex == null) return total > 0;
    return globalIndex < total - 1;
  }, [globalIndex, total]);

  const hasPrev = useMemo(() => {
    if (globalIndex == null) return total > 0;
    return globalIndex > 0;
  }, [globalIndex, total]);

  const goToGlobalIndex = useCallback(
    (globalIndex: number) => {
      const page = Math.floor(globalIndex / pageSize);
      const index = globalIndex % pageSize;
      setPage(page);
      setIndex(index);
    },
    [pageSize, setPage],
  );

  const goToNext = useCallback(() => {
    if (!hasNext) return;
    if (globalIndex == null) return goToGlobalIndex(0);
    goToGlobalIndex(globalIndex + 1);
  }, [hasNext, globalIndex, goToGlobalIndex]);

  const goToPrev = useCallback(() => {
    if (!hasPrev) return;
    if (globalIndex == null) return goToGlobalIndex(0);
    goToGlobalIndex(globalIndex - 1);
  }, [hasPrev, globalIndex, goToGlobalIndex]);

  const goToRandom = useCallback(() => {
    if (total === 0) return;
    goToGlobalIndex(Math.floor(Math.random() * total));
  }, [total, goToGlobalIndex]);

  const clipEvaluation = useMemo(() => {
    if (index == null) return props.clipEvaluation ?? null;
    if (isLoading) return null;
    return items[index] ?? null;
  }, [index, items, props.clipEvaluation, isLoading]);

  return {
    clipEvaluation,
    filter,
    total,
    isLoading,
    isError,
    hasNext,
    hasPrev,
    threshold,
    showAnnotations,
    showPredictions,
    index: globalIndex ?? null,
    next: goToNext,
    prev: goToPrev,
    random: goToRandom,
    toggleAnnotations: () => setShowAnnotations((v) => !v),
    togglePredictions: () => setShowPredictions((v) => !v),
    setThreshold,
  };
}
