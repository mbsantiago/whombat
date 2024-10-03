import { useCallback, useMemo, useState } from "react";

import type { PaginationController } from "@/lib/types";

export type ListSelection<T> = {
  current: T | null;
  index: number | null;
  hasPrev: boolean;
  hasNext: boolean;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  random: () => void;
};

export default function useListSelection<T>({
  initial,
  items,
  total,
  pagination,
}: {
  initial?: number;
  items: T[];
  total: number;
  pagination: PaginationController;
}) {
  const [index, setIndex] = useState<number | null>(initial || null);

  const { page, pageSize, setPage } = pagination;

  const globalIndex = useMemo(() => {
    if (index == null) return null;
    return index + page * pageSize;
  }, [index, page, pageSize]);

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

  const current = useMemo(() => {
    if (index == null) return null;
    return items[index];
  }, [index, items]);

  return {
    current,
    index: globalIndex,
    hasNext,
    hasPrev,
    next: goToNext,
    prev: goToPrev,
    goTo: goToGlobalIndex,
    random: goToRandom,
  };
}
