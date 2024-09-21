import useSpectrogramBox from "@/lib/hooks/spectrogram/useSpectrogramBBox";
import type { ViewportController } from "@/lib/hooks/window/useViewport";
import type { SpectrogramWindow } from "@/lib/types";
import { useCallback } from "react";

export const VALID_STYLE = {
  fillAlpha: 0.3,
  fillColor: "yellow",
  borderWidth: 1,
  borderColor: "yellow",
  borderDash: [4, 4],
};

export const INVALID_STYLE = {
  fillAlpha: 0.3,
  fillColor: "red",
  borderWidth: 1,
  borderColor: "red",
  borderDash: [4, 4],
};

export default function useSpectrogramZoom({
  viewport,
  onZoom,
}: {
  viewport: ViewportController;
  onZoom?: (window: SpectrogramWindow) => void;
}) {
  const { set: setViewport, save } = viewport;
  const handleZoom = useCallback(
    (window: SpectrogramWindow) => {
      save();
      setViewport(window);
      onZoom?.(window);
    },
    [setViewport, save, onZoom],
  );

  const { onMove, onMoveStart, onMoveEnd, drawFn } = useSpectrogramBox({
    viewport,
    onCreateBox: handleZoom,
  });

  return { onMove, onMoveStart, onMoveEnd, drawFn };
}
