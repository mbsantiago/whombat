import { useCallback, useRef } from "react";
import { useMove } from "react-aria";
import type { MoveEndEvent, MoveMoveEvent, MoveStartEvent } from "react-aria";

import type {
  MoveEndHandler,
  MoveHandler,
  MoveStartHandler,
  Position,
  SpectrogramWindow,
} from "@/lib/types";

/**
 * A custom React hook for handling move interactions (start, move, end) on a
 * HTML element.
 *
 * This hook utilizes `react-aria`'s `useMove` for accessible movement
 * interactions and integrates it with cursor position management on the
 * canvas. It provides callbacks for move start, move, and move end events.
 *
 * @example
 * const moveProps = useViewportMove({
 *   viewport: { time: { min: 0, max: 10 }, freq: { min: 0, max: 1000 } },
 *   cursorPosition,
 *   onMoveStart: (event) => console.log('Move started:', event),
 *   onMove: (event) => console.log('Moving:', event),
 *   onMoveEnd: (event) => console.log('Move ended:', event),
 * });
 *
 * return <canvas {...moveProps} />
 */
export default function useViewportMove({
  cursorPosition,
  onMoveStart,
  onMoveEnd,
  onMove,
}: {
  viewport: SpectrogramWindow;
  cursorPosition: React.MutableRefObject<Position>;
  onMoveStart?: MoveStartHandler;
  onMoveEnd?: MoveEndHandler;
  onMove?: MoveHandler;
}) {
  const initialPosition = useRef<Position | null>(null);
  const currentPosition = useRef<Position | null>(null);

  const handleMoveStart = useCallback(
    (e: MoveStartEvent) => {
      onMoveStart?.({ position: cursorPosition.current, ...e });
      initialPosition.current = cursorPosition.current;
      currentPosition.current = cursorPosition.current;
    },
    // NOTE: Dont add mousePosition.current to the dependencies
    // because it will cause unnecessary re-renders.
    [onMoveStart], // eslint-disable-line
  );

  const handleMove = useCallback(
    (e: MoveMoveEvent) => {
      if (initialPosition.current == null) return;
      currentPosition.current = cursorPosition.current;
      onMove?.({
        position: cursorPosition.current,
        initial: initialPosition.current,
        shift: {
          time: currentPosition.current.time - initialPosition.current.time,
          freq: initialPosition.current.freq - currentPosition.current.freq,
        },
        ...e,
      });
    },
    [onMove, cursorPosition.current], // eslint-disable-line
  );

  const handleMoveEnd = useCallback(
    (e: MoveEndEvent) => {
      onMoveEnd?.({ position: cursorPosition.current, ...e });
      initialPosition.current = null;
      currentPosition.current = null;
    },
    [onMoveEnd], // eslint-disable-line
  );

  return useMove({
    onMoveStart: handleMoveStart,
    onMove: handleMove,
    onMoveEnd: handleMoveEnd,
  });
}
