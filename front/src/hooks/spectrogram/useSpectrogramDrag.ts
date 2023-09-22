import { useCallback } from "react";

import useWindowDrag from "@/hooks/window/useWindowDrag";
import { type SpectrogramWindow } from "@/api/spectrograms";
import { type ScratchState } from "@/hooks/motions/useDrag";
import { type PanToEvent } from "@/machines/spectrogram";

export default function useSpectrogramDrag({
  drag,
  window,
  active,
  send,
}: {
  window: SpectrogramWindow;
  active: boolean;
  drag: ScratchState;
  send: (event: PanToEvent) => void;
}) {
  const handleOnDrag = useCallback(
    (newWindow: SpectrogramWindow) => {
      send({ type: "PAN_TO", window: newWindow });
    },
    [send],
  );
  useWindowDrag({
    window: window,
    setWindow: handleOnDrag,
    active,
    dragState: drag,
  });
}
