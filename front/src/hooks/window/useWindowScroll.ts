import { useKeyPress, useUpdateEffect } from "react-use";

import { type ScrollState } from "@/hooks/motions/useMouseWheel";

export default function useWindowScroll({
  shiftWindow,
  scrollState,
  active = true,
}: {
  shiftWindow?: (
    shiftBy: { time: number; freq: number },
    relative: boolean,
  ) => void;
  active?: boolean;
  scrollState: ScrollState;
}) {
  const [shift] = useKeyPress("Shift");
  const [ctrl] = useKeyPress("Control");

  const { deltaY, eventNum } = scrollState;
  // Update window when scrolling
  useUpdateEffect(() => {
    if (active && shift && !ctrl && deltaY !== 0) {
      let dT = deltaY / 2000;
      shiftWindow?.({ time: dT, freq: 0 }, true);
    }
  }, [deltaY, eventNum, active, shift, ctrl, shiftWindow]);
}
