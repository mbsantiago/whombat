import { useCallback, useEffect, useState } from "react";

import drawInterval, { DEFAULT_INTERVAL_STYLE } from "@/draw/interval";
import { type Style } from "@/draw/styles";
import useDrag from "@/hooks/motions/useDrag";
import { type ScratchState } from "@/hooks/motions/useDrag";
import { type Dimensions, type Interval } from "@/utils/types";

export interface UseCreateIntervalProps {
  drag: ScratchState;
  active: boolean;
  onCreate?: ({
    interval,
    dims,
  }: {
    interval: Interval;
    dims: Dimensions;
  }) => void;
  style?: Style;
}

export default function useCreateInterval({
  drag,
  active,
  onCreate = () => null,
  style = DEFAULT_INTERVAL_STYLE,
}: UseCreateIntervalProps): {
  interval: Interval | null;
  isDrawing: boolean;
  draw: (ctx: CanvasRenderingContext2D) => void;
} {
  const [dims, setDims] = useState<Dimensions>({ width: 0, height: 0 });
  const [interval, setInterval] = useState<Interval | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  const { elW, elH } = drag;
  useEffect(() => {
    if (active) {
      if (elW != null && elH != null) setDims({ width: elW, height: elH });
    }
  }, [elW, elH, active]);

  const { isDragging, start, current } = useDrag({
    dragState: drag,
    active,
  });

  useEffect(() => {
    if (active) {
      if (isDragging) {
        setIsDrawing(true);
      } else {
        setIsDrawing(false);

        if (interval != null) {
          onCreate({
            interval,
            dims,
          });
          setInterval(null);
        }
      }
    }
  }, [active, isDragging, interval, onCreate, dims]);

  useEffect(() => {
    if (active) {
      if (start != null && current != null) {
        const left = Math.min(start[0], current[0]);
        const right = Math.max(start[0], current[0]);
        setInterval([left, right]);
      }
    }
  }, [active, current, start]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!active) return;
      if (!isDrawing) return;
      if (interval == null) return;
      drawInterval(
        ctx,
        {
          min: interval[0],
          max: interval[1],
        },
        style,
      );
    },
    [active, interval, isDrawing, style],
  );

  return {
    interval,
    isDrawing,
    draw,
  };
}
