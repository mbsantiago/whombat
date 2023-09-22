import { useState } from "react";
import { useUpdateEffect } from "react-use";

import { type SpectrogramWindow } from "@/api/spectrograms";
import { type SetWindowFn } from "@/hooks/window/useWindow";

export type DragState = {
  isScratching: boolean;
  x?: number;
  y?: number;
  dx?: number;
  dy?: number;
  docX?: number;
  docY?: number;
  posX?: number;
  posY?: number;
  elH?: number;
  elW?: number;
  elX?: number;
  elY?: number;
};

export type DragFn = ({
  window,
  offset,
}: {
  window: SpectrogramWindow;
  offset: DragState;
}) => SpectrogramWindow | null;

export function dragBackground({
  window,
  offset: { dx, dy, elH, elW },
}: {
  window: SpectrogramWindow;
  offset: DragState;
}): SpectrogramWindow {
  if (dx == null || dy == null || elH == null || elW == null) {
    return window;
  }

  let { min: start, max: end } = window.time;
  let { min: low, max: high } = window.freq;

  let height = high - low;
  let width = end - start;

  let dT = (width * dx) / elW;
  let dF = (height * dy) / elH;

  return {
    time: {
      min: start - dT,
      max: end - dT,
    },
    freq: {
      min: low + dF,
      max: high + dF,
    },
  };
}

export default function useWindowDrag({
  window: initial,
  setWindow,
  dragState,
  active = true,
  dragFunction = dragBackground,
}: {
  window: SpectrogramWindow;
  dragState: DragState;
  setWindow?: SetWindowFn;
  dragFunction?: DragFn;
  active?: boolean;
}) {
  const [startPoint, setStartPoint] = useState<SpectrogramWindow | null>(null);

  const { isScratching } = dragState;

  // Update starting point when scratching starts
  useUpdateEffect(() => {
    if (isScratching && active) {
      setStartPoint(initial);
    } else {
      setStartPoint(null);
    }
  }, [isScratching, active]);

  useUpdateEffect(() => {
    if (active && startPoint != null && isScratching) {
      let draggedWindow = dragFunction({
        window: startPoint,
        offset: dragState,
      });
      if (draggedWindow != null) {
        setWindow?.(draggedWindow);
      }
    }
  }, [dragState, active, setWindow, dragFunction, startPoint]);
}
