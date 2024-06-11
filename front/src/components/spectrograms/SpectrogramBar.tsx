import type {
  MoveStartEvent,
  MoveMoveEvent,
  MoveEndEvent,
  PressEvent,
} from "react-aria";

import useSpectrogramBar from "@/hooks/spectrogram/useSpectrogramBar";

import type { SpectrogramWindow, Position, ScrollEvent } from "@/types";

export default function SpectrogramBar({
  bounds,
  viewport,
  onMove,
  onMoveStart,
  onMoveEnd,
  onPress,
  onScroll,
}: {
  bounds: SpectrogramWindow;
  viewport: SpectrogramWindow;
  onMoveStart?: (event: { position: Position } & MoveStartEvent) => void;
  onMoveEnd?: (event: { position: Position } & MoveEndEvent) => void;
  onMove?: (
    event: {
      position: Position;
      initial: Position;
      shift: Position;
    } & MoveMoveEvent,
  ) => void;
  onPress?: (event: { position: Position } & PressEvent) => void;
  onScroll?: (event: ScrollEvent) => void;
}) {
  const { ref, position, props } = useSpectrogramBar({
    bounds,
    viewport,
    onMove,
    onMoveStart,
    onMoveEnd,
    onPress,
    onScroll,
  });

  return (
    <div
      draggable={false}
      className="flex relative flex-row items-center w-full h-8 rounded-md cursor-pointer select-none group outline outline-1 outline-stone-300 bg-stone-200 dark:bg-stone-800 dark:outline-stone-700"
      ref={ref}
      {...props}
    >
      <div
        draggable={false}
        tabIndex={0}
        className="absolute bg-emerald-300 rounded-md border border-emerald-500 cursor-pointer dark:bg-emerald-700 focus:ring-4 focus:outline-none group-hover:bg-emerald-500/80 hover:bg-emerald-500/80 focus:ring-emerald-500/50"
        style={position}
      />
    </div>
  );
}
