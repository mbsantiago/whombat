import { useKeyPress, useUpdateEffect } from "react-use";

import { type ScaleWindowFn } from "@/hooks/spectrogram/useWindow";
import { type ScrollState } from "@/hooks/motions/useMouseWheel";

export default function useWindowZoom({
  scaleWindow,
  scrollState,
  active = true,
}: {
  scaleWindow?: ScaleWindowFn;
  active?: boolean;
  scrollState: ScrollState;
}) {
  const [shift] = useKeyPress("Shift");
  const [ctrl] = useKeyPress("Control");

  const { deltaY, eventNum } = scrollState;
  // Update window when scrolling
  useUpdateEffect(() => {
    if (active && deltaY !== 0) {
      const factor = deltaY > 0 ? 1.1 : 1 / 1.1;
      if (ctrl && !shift) {
        scaleWindow?.({ time: factor, freq: 1 });
      } else if (ctrl && shift) {
        scaleWindow?.({ time: 1, freq: factor });
      }
    }
  }, [deltaY, eventNum, active, ctrl, shift, scaleWindow]);
}
