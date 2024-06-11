import { useCallback } from "react";
import type { Interval, SpectrogramWindow } from "@/types";
import useLifoQueue from "@/hooks/utils/useLifoQueue";

type Viewport = {
  current: SpectrogramWindow;
  bounds: SpectrogramWindow;
  set(window: SpectrogramWindow): void;
  setTimeInterval(interval: Interval): void;
  setFrequencyInterval(interval: Interval): void;
  scale({ time, freq }: { time?: number; freq?: number }): void;
  shift({ time, freq }: { time?: number; freq?: number }): void;
  centerOn: ({ time, freq }: { time?: number; freq?: number }) => void;
  reset(): void;
  save(): void;
  back(): void;
};

export default function useViewport({
  initial,
  bounds,
}: {
  initial: SpectrogramWindow;
  bounds: SpectrogramWindow;
}): Viewport {
  const queue = useLifoQueue<SpectrogramWindow>(initial);
}
