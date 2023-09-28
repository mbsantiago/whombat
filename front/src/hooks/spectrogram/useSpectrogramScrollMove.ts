import { useCallback, type RefObject } from "react";

import { type ShiftWindowEvent } from "@/machines/spectrogram";
import useWindowScroll from "@/hooks/window/useWindowScroll";

export default function useSpectrogramScrollMove({
  active,
  send,
  ref,
}: {
  active: boolean;
  send: (event: ShiftWindowEvent) => void;
  ref: RefObject<HTMLCanvasElement>;
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
    ref,
  });
}
