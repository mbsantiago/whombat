import { type HTMLProps, useRef, useCallback, useMemo } from "react";
import { type SpectrogramWindow } from "@/api/spectrograms";
import { useScratch } from "react-use";
import { type ShiftWindowFn, type SetWindowFn } from "@/hooks/useWindow";
import useWindowDrag, { type DragFn } from "@/hooks/useWindowDrag";
import useMouseWheel from "@/hooks/useMouseWheel";
import useWindowScroll from "@/hooks/useWindowScroll";

type BarPosition = {
  left: number;
  width: number;
  top: number;
  height: number;
};

export function getWindowBarPosition({
  width,
  height,
  window,
  bounds,
}: {
  width?: number;
  height?: number;
  window: SpectrogramWindow;
  bounds: SpectrogramWindow;
}): BarPosition {
  if (width == null || height == null) {
    return { left: 0, width: 0, top: 0, height: 0 };
  }

  const bottom =
    (bounds.freq.max - window.freq.min) / (bounds.freq.max - bounds.freq.min);
  const top =
    (bounds.freq.max - window.freq.max) / (bounds.freq.max - bounds.freq.min);
  const left =
    (window.time.min - bounds.time.min) / (bounds.time.max - bounds.time.min);
  const right =
    (window.time.max - bounds.time.min) / (bounds.time.max - bounds.time.min);
  return {
    top: Math.max(Math.min(Math.round(top * height), height), 0),
    left: Math.max(Math.min(Math.round(left * width), width), 0),
    height: Math.max(Math.min(Math.round((bottom - top) * height), height), 0),
    width: Math.max(Math.min(Math.round((right - left) * width), width), 0),
  };
}

type WindowBarProps = {
  window: SpectrogramWindow;
  bounds: SpectrogramWindow;
  setWindow?: SetWindowFn;
  shiftWindow?: ShiftWindowFn;
};

export default function WindowBar({
  window,
  bounds,
  setWindow,
  shiftWindow,
  ...rest
}: WindowBarProps & HTMLProps<HTMLDivElement>) {
  const barRef = useRef<HTMLDivElement>(null);

  const position = useMemo(
    () =>
      getWindowBarPosition({
        width: barRef.current?.offsetWidth,
        height: barRef.current?.offsetHeight,
        window,
        bounds,
      }),
    [window, bounds],
  );

  const [dragRef, dragState] = useScratch();

  const dragThumb: DragFn = useCallback(
    ({ window: win, offset }) => {
      if (barRef.current == null) return null;

      const { offsetWidth: elW, offsetHeight: elH } = barRef.current;
      const { dx, dy, x, y } = offset;

      if (
        dx == null ||
        dy == null ||
        elW == null ||
        elH == null ||
        x == null ||
        y == null
      )
        return null;

      let { min: start, max: end } = bounds.time;
      let { min: low, max: high } = bounds.freq;
      let dT = ((end - start) * dx) / elW;
      let dF = ((high - low) * dy) / elH;

      let centerT = ((end - start) * x) / elW;
      let centerF = ((high - low) * y) / elH;

      let duration = win.time.max - win.time.min;
      let bandwidth = win.freq.max - win.freq.min;

      return {
        time: {
          min: centerT - duration / 2 + dT,
          max: centerT + duration / 2 + dT,
        },
        freq: {
          min: centerF - bandwidth / 2 + dF,
          max: centerF + bandwidth / 2 + dF,
        },
      };
    },
    [bounds],
  );

  useWindowDrag({
    window,
    setWindow,
    dragState,
    dragFunction: dragThumb,
  });

  // const scrollState = useMouseWheel(barRef);
  //
  // // This hook allows the user to move the spectrogram around with the mouse
  // useWindowScroll({
  //   shiftWindow,
  //   scrollState,
  // });

  return (
    <div draggable={false} ref={dragRef}>
      <div
        draggable={false}
        className="group select-none relative w-full flex flex-row items-center h-8 outline outline-1 rounded-md outline-stone-300 bg-stone-200 dark:bg-stone-800 dark:outline-stone-700 cursor-pointer"
        ref={barRef}
        {...rest}
      >
        <div
          draggable={false}
          tabIndex={0}
          className="absolute bg-emerald-300 dark:bg-emerald-700 rounded-md border border-emerald-500 group-hover:bg-emerald-500/80 hover:bg-emerald-500/80 cursor-pointer focus:ring-4 focus:ring-emerald-500/50 focus:outline-none"
          style={{
            ...position,
          }}
        />
      </div>
    </div>
  );
}
