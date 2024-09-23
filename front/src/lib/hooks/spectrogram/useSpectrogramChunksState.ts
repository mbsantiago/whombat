import { produce } from "immer";
import { useCallback, useState } from "react";

import type { Chunk, Interval } from "@/lib/types";

export type ChunkState = {
  interval: Interval;
  buffer: Interval;
  isReady: boolean;
  isLoading: boolean;
  isError: boolean;
  index: number;
};

export type SegmentsState = {
  chunks: ChunkState[];
  setError: (index: number) => void;
  setReady: (index: number) => void;
  setChunks: (chunks: Chunk[]) => void;
  startLoading: (indices: number[]) => void;
};

export default function useSpectrogramChunksState(
  initialChunks: Chunk[] = [],
): SegmentsState {
  const [state, setState] = useState<ChunkState[]>(
    initialChunks.map(({ interval, buffer }, index) => ({
      buffer,
      interval,
      isReady: false,
      isLoading: false,
      isError: false,
      index,
    })),
  );

  const setError = useCallback((index: number) => {
    setState((prev) =>
      produce(prev, (draft) => {
        if (index < 0 || index >= draft.length) return;
        draft[index].isError = true;
        draft[index].isLoading = false;
        draft[index].isReady = false;
      }),
    );
  }, []);

  const setReady = useCallback((index: number) => {
    setState((prev) =>
      produce(prev, (draft) => {
        if (index < 0 || index >= draft.length) return;
        draft[index].isReady = true;
        draft[index].isLoading = false;
        draft[index].isError = false;
      }),
    );
  }, []);

  const startLoading = useCallback((indices: number[]) => {
    setState((prev) =>
      produce(prev, (draft) => {
        indices.forEach((index) => {
          draft[index].isLoading = true;
        });
      }),
    );
  }, []);

  const setChunks = useCallback((segments: Chunk[]) => {
    setState(
      segments.map(({ interval, buffer }, index) => ({
        interval,
        buffer,
        isReady: false,
        isLoading: false,
        isError: false,
        index,
      })),
    );
  }, []);

  return {
    chunks: state,
    setError,
    setReady,
    startLoading,
    setChunks,
  };
}
