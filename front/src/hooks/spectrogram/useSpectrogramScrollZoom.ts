import { useCallback } from "react";

import useWindowZoom from "@/hooks/window/useWindowZoom";
import { type ScrollState } from "@/hooks/motions/useMouseWheel";
import { type ScaleWindowEvent } from "@/machines/spectrogram";

export default function useSpectrogramScrollZoom({
  active,
  scrollState,
  send,
}: {
  active: boolean;
  scrollState: ScrollState;
  send: (event: ScaleWindowEvent) => void;
}) {
  const handleOnScrollZoom = useCallback(
    (scaleBy: { time?: number; freq?: number }) => {
      send({ type: "SCALE_WINDOW", scaleBy });
    },
    [send],
  );
  useWindowZoom({
    active,
    scaleWindow: handleOnScrollZoom,
    scrollState,
  });
}
