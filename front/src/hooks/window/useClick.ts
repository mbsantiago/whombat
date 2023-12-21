import { useState, useCallback } from "react";
import { useMove } from "react-aria";
import { scalePixelsToWindow } from "@/utils/geometry";
import { type SpectrogramWindow } from "@/api/spectrograms";
import { usePress } from "react-aria";

/**
 * A type representing the shift in time and frequency.
 */
export type Shift = {
  time: number;
  freq: number;
};

/**
 * The `useDragObjectOnViewport` hook manages dragging behavior for an object
 * within a specified viewport.
 *
 */
export default function useClick({
  viewport,
  dimensions: { width, height },
  onPress,
}: {
  viewport: SpectrogramWindow;
  dimensions: { width: number; height: number };
  onPress?: () => void;
}) {
  const { pressProps, isPressed } = usePress({
    onPressStart: (e) => {
      console.log(e);
      onPress?.();
    },
  });

  return {
    pressProps,
    isPressed,
  };
}
