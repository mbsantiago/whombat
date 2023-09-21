import { useState, useEffect, useCallback } from "react";

import useDrag from "@/hooks/motions/useDrag";
import { type ScratchState } from "@/hooks/motions/useDrag";
import { type Dimensions } from "@/utils/types";
import { type Style } from "@/draw/styles";
import drawTimeStamp, { DEFAULT_ONSET_STYLE } from "@/draw/onset";

export interface UseCreateTimeStampProps {
  drag: ScratchState;
  active: boolean;
  onCreate: ({
    timeStamp,
    dims,
  }: {
    timeStamp: number;
    dims: Dimensions;
  }) => void;
  style?: Style;
}

export default function useCreateTimeStamp({
  drag,
  active,
  onCreate,
  style = DEFAULT_ONSET_STYLE,
}: UseCreateTimeStampProps) {
  const [dims, setDims] = useState<Dimensions>({ width: 0, height: 0 });
  const [timeStamp, setTimeStamp] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  const { elW, elH } = drag;

  // Keep track of the dimensions of the element
  useEffect(() => {
    if (elW != null && elH != null) setDims({ width: elW, height: elH });
  }, [elW, elH]);

  const { isDragging, current } = useDrag({
    dragState: drag,
    active,
  });

  useEffect(() => {
    if (active) {
      if (isDragging) {
        setIsDrawing(true);
      } else {
        setIsDrawing(false);

        if (timeStamp != null) {
          onCreate({
            timeStamp,
            dims,
          });
        }
      }
    }
  }, [active, isDragging, timeStamp, onCreate, dims]);

  useEffect(() => {
    if (active) {
      setTimeStamp(current?.[0] ?? null);
    }
  }, [active, current]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!active) return;
      if (!isDrawing) return;
      if (timeStamp == null) return;
      drawTimeStamp(ctx, timeStamp, style);
    },
    [active, timeStamp, style, isDrawing],
  );

  return {
    draw,
    timeStamp,
    isDrawing,
  };
}
