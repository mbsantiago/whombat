import { useCallback } from "react";
import { usePress } from "react-aria";
import type { PressEvent } from "react-aria";

import type { Position, PressHandler } from "@/lib/types";

/**
 * A custom React hook for handling press interactions (clicks/taps) on a
 * HTML element.
 *
 * This hook utilizes `react-aria`'s `usePress` for accessible press
 * interactions and integrates it with cursor position management on the
 * element.
 *
 * @example
 * const pressProps = useViewportPress({
 *   onPress: (event) => console.log('Pressed at:', event.position),
 *   cursorPosition,
 * });
 *
 * return <canvas {...pressProps} />
 */
export default function useViewportPress({
  onPress,
  cursorPosition,
}: {
  onPress?: PressHandler;
  cursorPosition: React.MutableRefObject<Position>;
}) {
  const handlePress = useCallback(
    (e: PressEvent) => {
      onPress?.({
        position: cursorPosition.current,
        ...e,
      });
    },
    // NOTE: Dont add mousePosition.current to the dependencies
    // because it will cause unnecessary re-renders.
    [onPress], // eslint-disable-line
  );

  return usePress({
    onPress: handlePress,
  });
}
