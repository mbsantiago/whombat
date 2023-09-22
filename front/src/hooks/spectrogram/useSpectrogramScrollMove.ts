import { useCallback } from "react";

import { type ScrollState } from "@/hooks/motions/useMouseWheel";
import { type ShiftWindowEvent } from "@/machines/spectrogram";
import useWindowScroll from "@/hooks/window/useWindowScroll";

export default function useSpectrogramScrollMove({
  active,
  scrollState,
  send,
}: {
  active: boolean;
  scrollState: ScrollState;
  send: (event: ShiftWindowEvent) => void;
}) {
  const handleOnScroll = useCallback(
    (shiftBy: { time: number; freq: number }, relative: boolean) => {
      send({ type: "SHIFT_WINDOW", shiftBy, relative });
    },
    [send],
  );
  useWindowScroll({
    active,
    shiftWindow: handleOnScroll,
    scrollState,
  });
}
