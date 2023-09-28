import { useCallback, type RefObject } from "react";

import useWindowZoom from "@/hooks/window/useWindowZoom";
import { type ScaleWindowEvent } from "@/machines/spectrogram";

export default function useSpectrogramScrollZoom({
  active,
  send,
  ref,
}: {
  active: boolean;
  send: (event: ScaleWindowEvent) => void;
  ref: RefObject<HTMLCanvasElement>;
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
    ref,
  });
}
