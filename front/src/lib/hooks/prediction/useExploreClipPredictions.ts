import { useCallback, useMemo, useState } from "react";

import useClipPredictions from "@/app/hooks/api/useClipPredictions";

import type {
  ClipPrediction,
  ClipPredictionFilter,
  Filter,
  Interval,
} from "@/lib/types";

type ExplorationState = {
  filter: Filter<ClipPredictionFilter>;
  clipPrediction: ClipPrediction | null;
  isLoading: boolean;
  isError: boolean;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
  threshold: Interval;
  index: number | null;
};

type ExplorationControls = {
  next: () => void;
  prev: () => void;
  random: () => void;
  setThreshold: (threshold: Interval) => void;
};

const DEFAULT_THRESHOLD: Interval = { min: 0.5, max: 1 };

export default function useExploreClipPredictions(props: {
  clipPrediction?: ClipPrediction;
  filter?: ClipPredictionFilter;
  threshold?: Interval;
}): ExplorationState & ExplorationControls {
  const [index, setIndex] = useState<number | null>(
    props.clipPrediction == null ? 0 : null,
  );
  const [threshold, setThreshold] = useState<Interval>(
    props.threshold ?? DEFAULT_THRESHOLD,
  );

  const {
    items,
    total,
    filter,
    isLoading,
    isError,
    pagination: { setPage, pageSize, page },
  } = useClipPredictions({
    pageSize: 10,
    filter: props.filter,
    fixed: Object.keys(props.filter ?? {}) as (keyof ClipPredictionFilter)[],
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

  const clipPrediction = useMemo(() => {
    if (index == null) return props.clipPrediction ?? null;
    if (isLoading) return null;
    return items[index] ?? null;
  }, [index, items, props.clipPrediction, isLoading]);

  return {
    clipPrediction,
    filter,
    total,
    isLoading,
    isError,
    hasNext,
    hasPrev,
    threshold,
    index: globalIndex ?? null,
    next: goToNext,
    prev: goToPrev,
    random: goToRandom,
    setThreshold,
  };
}
