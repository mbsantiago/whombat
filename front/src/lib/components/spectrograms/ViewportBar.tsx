import type {
  MoveEndEvent,
  MoveMoveEvent,
  MoveStartEvent,
  PressEvent,
} from "react-aria";

import useSpectrogramBar from "@/lib/hooks/spectrogram/useSpectrogramBar";

import type { Position, ScrollEvent, SpectrogramWindow } from "@/lib/types";

/**
 * A draggable bar component used to interact with and navigate a spectrogram
 * visualization.
 */
export default function SpectrogramBar({
  bounds,
  viewport,
  onMove,
  onMoveStart,
  onMoveEnd,
  onPress,
  onScroll,
}: {
  /** The boundaries within which the bar can move. */
  bounds: SpectrogramWindow;
  /** The current viewport of the spectrogram. */
  viewport: SpectrogramWindow;
  /** A callback function triggered when the bar starts moving. */
  onMoveStart?: (event: { position: Position } & MoveStartEvent) => void;
  /** A callback function triggered when the bar finishes moving. */
  onMoveEnd?: (event: { position: Position } & MoveEndEvent) => void;
  /** A callback function triggered as the bar is being moved. */
  onMove?: (
    event: {
      position: Position;
      initial: Position;
      shift: Position;
    } & MoveMoveEvent,
  ) => void;
  /** A callback function triggered when the bar is pressed. */
  onPress?: (event: { position: Position } & PressEvent) => void;
  /** A callback function triggered when the bar is scrolled. */
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
