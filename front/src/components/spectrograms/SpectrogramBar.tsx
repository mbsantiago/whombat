import { useMemo, useRef, useState } from "react";

import { getViewportPosition } from "@/utils/windows";
import useWindowDrag from "@/hooks/window/useWindowDrag";
import { type SpectrogramWindow } from "@/api/spectrograms";

export default function SpectrogramBar({
  bounds,
  viewport,
  onMove,
}: {
  bounds: SpectrogramWindow;
  viewport: SpectrogramWindow;
  onMove?: (viewport: SpectrogramWindow) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const { width, height } = barRef.current?.getBoundingClientRect() ?? {
    width: 0,
    height: 0,
  };

  const barPosition = useMemo(
    () =>
      getViewportPosition({
        width,
        height,
        viewport,
        bounds,
      }),
    [viewport, bounds, width, height],
  );

  const [intialViewport, setInitialViewport] = useState(viewport);

  const { moveProps } = useWindowDrag({
    dimensions: { width, height },
    viewport: bounds,
    onMoveStart: () => setInitialViewport(viewport),
    onMove: ({ time, freq }) => {
      onMove?.({
        time: {
          min: intialViewport.time.min + time,
          max: intialViewport.time.max + time,
        },
        freq: {
          min: intialViewport.freq.min - freq,
          max: intialViewport.freq.max - freq,
        },
      });
    },
    onMoveEnd: () => setInitialViewport(viewport),
  });

  return (
    <div
      draggable={false}
      className="flex relative flex-row items-center w-full h-8 rounded-md cursor-pointer select-none group outline outline-1 outline-stone-300 bg-stone-200 dark:bg-stone-800 dark:outline-stone-700"
      ref={barRef}
    >
      <div
        draggable={false}
        tabIndex={0}
        className="absolute bg-emerald-300 rounded-md border border-emerald-500 cursor-pointer dark:bg-emerald-700 focus:ring-4 focus:outline-none group-hover:bg-emerald-500/80 hover:bg-emerald-500/80 focus:ring-emerald-500/50"
        {...moveProps}
        style={{
          left: barPosition.left,
          top: barPosition.top,
          width: barPosition.width,
          height: barPosition.height,
        }}
      />
    </div>
  );
}
