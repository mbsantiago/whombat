import { useCallback } from "react";

import { type BBox, type Dimensions } from "@/utils/types";
import { type DragState } from "@/hooks/useDrag";
import { type SpectrogramWindow } from "@/api/spectrograms";
import { type SetWindowFn } from "@/hooks/useWindow";
import { scaleBBoxToWindow } from "../utils/geometry";
import useCreateBBox from "./useCreateBBox";
import { ZOOM_SELECTION_STYLE } from "./useIntervalZoom";

const MIN_TIME_ZOOM = 0.001;
const MIN_FREQ_ZOOM = 1;

function validateBBox(bbox: BBox): boolean {
  const [start, high, end, low] = bbox;
  if (end - start < MIN_TIME_ZOOM) return false;
  if (high - low < MIN_FREQ_ZOOM) return false;
  return true;
}

export default function useBBoxZoom({
  window,
  setWindow,
  dimensions,
  drag,
  active = false,
  onZoom,
}: {
  window: SpectrogramWindow;
  setWindow: SetWindowFn;
  dimensions: Dimensions;
  drag: DragState;
  active: boolean;
  onZoom?: () => void;
}) {
  const handleSelectZoom = useCallback(
    (bbox: BBox) => {
      const [start, high, end, low] = scaleBBoxToWindow(
        dimensions,
        bbox,
        window,
      );

      if (validateBBox([start, high, end, low])) {
        setWindow({
          time: { min: start, max: end },
          freq: { min: low, max: high },
        });
        onZoom?.();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dimensions.width, dimensions.height, window, setWindow, onZoom],
  );

  return useCreateBBox({
    drag,
    onCreate: handleSelectZoom,
    active,
    style: ZOOM_SELECTION_STYLE,
  });
}
