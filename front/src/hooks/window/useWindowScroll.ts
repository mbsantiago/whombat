import { useCallback, type RefObject } from "react";

import useMouseWheel, { type ScrollState} from "@/hooks/motions/useMouseWheel";


export default function useWindowScroll({
  shiftWindow,
  active = true,
  ref,
}: {
  shiftWindow?: (
    shiftBy: { time: number; freq: number },
    relative: boolean,
  ) => void;
  active?: boolean;
  ref: RefObject<HTMLCanvasElement>;
}) {

  // Update window when scrolling
  const onScroll = useCallback((state: ScrollState) => {
    const { deltaY, shift, ctrl, input } = state;

    if (
      active &&
      shift &&
      !ctrl &&
      deltaY !== 0 &&
      !input
    ) {
      let dT = deltaY / 2000;
      shiftWindow?.({ time: dT, freq: 0 }, true);
    }
  }, [active, shiftWindow]);

  useMouseWheel({
    ref,
    onScroll,
    preventDefault: true,
  });
}
