import { useCallback } from "react";

import { scaleBBoxToWindow } from "@/utils/geometry";
import useCreateBBox from "@/hooks/draw/useCreateBBox";
import { type BBox, type Dimensions } from "@/utils/types";
import { type ScratchState } from "@/hooks/motions/useDrag";
import { type SpectrogramWindow } from "@/api/spectrograms";
import { type ZoomToEvent } from "@/machines/spectrogram";

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

export default function useSpectrogramBBoxZoom({
  window,
  drag,
  active = false,
  send,
}: {
  window: SpectrogramWindow;
  drag: ScratchState;
  active: boolean;
  send: (event: ZoomToEvent) => void;
}) {
  const handleSelectZoom = useCallback(
    ({ bbox, dims }: { bbox: BBox; dims: Dimensions }) => {
      const [start, high, end, low] = scaleBBoxToWindow(dims, bbox, window);
      if (validateBBox([start, high, end, low])) {
        const newWindow = {
          time: { min: start, max: end },
          freq: { min: low, max: high },
        };
        send({ type: "ZOOM_TO", window: newWindow });
      }
    },
    [window, send],
  );

  const { draw } = useCreateBBox({
    drag,
    onCreate: handleSelectZoom,
    active,
    style: ZOOM_SELECTION_STYLE,
  });

  return draw;
}
