import { useCallback, useState } from "react";
import { produce } from "immer";
import type { Interval } from "@/types";

export type IntervalState = {
  interval: Interval;
  isReady: boolean;
  isLoading: boolean;
  isError: boolean;
  index: number;
};

export type SegmentsState = {
  segments: IntervalState[];
  setError: (index: number) => void;
  setReady: (index: number) => void;
  setSegments: (segments: Interval[]) => void;
  startLoading: (indices: number[]) => void;
};

export default function useSegments(
  initialSegments: Interval[] = [],
): SegmentsState {
  const [state, setState] = useState<IntervalState[]>(
    initialSegments.map((interval, index) => ({
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
        draft[index].isError = true;
        draft[index].isLoading = false;
        draft[index].isReady = false;
      }),
    );
  }, []);

  const setReady = useCallback((index: number) => {
    setState((prev) =>
      produce(prev, (draft) => {
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

  const setSegments = useCallback((segments: Interval[]) => {
    setState(
      segments.map((interval, index) => ({
        interval,
        isReady: false,
        isLoading: false,
        isError: false,
        index,
      })),
    );
  }, []);

  return {
    segments: state,
    setError,
    setReady,
    startLoading,
    setSegments,
  };
}
