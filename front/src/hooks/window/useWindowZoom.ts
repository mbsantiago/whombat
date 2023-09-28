import { type RefObject, useCallback } from "react";

import useMouseWheel, { type ScrollState } from "@/hooks/motions/useMouseWheel";
import { type ScaleWindowFn } from "@/hooks/window/useWindow";

export default function useWindowZoom({
  scaleWindow,
  ref,
  active = true,
}: {
  scaleWindow?: ScaleWindowFn;
  active?: boolean;
  ref: RefObject<HTMLCanvasElement>;
}) {
  // Update window when scrolling
  const onScroll = useCallback(
    (state: ScrollState) => {
      const { deltaY, shift, ctrl, input } = state;

      if (active && deltaY !== 0) {
        const factor = deltaY > 0 ? 1.1 : 1 / 1.1;
        if (ctrl && !shift && !input) {
          scaleWindow?.({ time: factor, freq: 1 });
        } else if (ctrl && shift && !input) {
          scaleWindow?.({ time: 1, freq: factor });
        }
      }
    },
    [active, scaleWindow],
  );

  useMouseWheel({
    ref,
    onScroll,
    preventDefault: true,
  });
}
