import { useCallback } from "react";
import { scaleBBoxToWindow } from "@/utils/geometry";
import useCreateBBox from "@/hooks/draw/useCreateBBox";

import { type BBox, type Dimensions } from "@/utils/types";
import { type ScratchState } from "@/hooks/motions/useDrag";
import { type SpectrogramWindow } from "@/api/spectrograms";
import { type SetWindowFn } from "@/hooks/spectrogram/useWindow";

export const ZOOM_SELECTION_STYLE = {
  fillAlpha: 0.3,
  fillColor: "red",
  borderWidth: 1,
  borderColor: "red",
  borderDash: [4, 4],
};

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
  drag,
  active = false,
  onZoom,
}: {
  window: SpectrogramWindow;
  setWindow: SetWindowFn;
  drag: ScratchState;
  active: boolean;
  onZoom?: (window: SpectrogramWindow) => void;
}) {
  const handleSelectZoom = useCallback(
    ({ bbox, dims }: { bbox: BBox; dims: Dimensions }) => {
      const [start, high, end, low] = scaleBBoxToWindow(dims, bbox, window);

      if (validateBBox([start, high, end, low])) {
        const newWindow = {
          time: { min: start, max: end },
          freq: { min: low, max: high },
        };
        setWindow(newWindow);
        onZoom?.(newWindow);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [window, setWindow, onZoom],
  );

  return useCreateBBox({
    drag,
    onCreate: handleSelectZoom,
    active,
    style: ZOOM_SELECTION_STYLE,
  });
}
