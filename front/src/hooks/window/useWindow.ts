/** Manage a spectrogram window and its bounds.
 *
 * A spectrogram window is a rectangle in the time-frequency plane.
 *
 * The user can navigate the spectrogram by moving the window around, zooming
 * in and out, centering the window on a specific point, or other actions.
 *
 * The window is always contained within the bounds, which are the limits of
 * the spectrogram.
 *
 * This module provides a react Hook that manages the state of the window and
 * its bounds, and provides functions to manipulate the window.
 */

import { useCallback, useEffect, useState } from "react";
import { type Dispatch, type SetStateAction } from "react";

import {
  adjustWindowToBounds,
  centerWindowOn,
  scaleWindow,
  shiftWindow,
} from "@/utils/windows";
import { type SpectrogramWindow } from "@/api/spectrograms";

export type ShiftWindowFn = (
  shiftBy: { time: number; freq: number },
  relative: boolean,
) => void;

export type SetWindowFn = (window: SpectrogramWindow) => void;

export type CenterWindowFn = ({
  time,
  freq,
}: {
  time?: number;
  freq?: number;
}) => void;

export type ScaleWindowFn = ({
  time,
  freq,
}: {
  time?: number;
  freq?: number;
}) => void;

export interface WindowState {
  window: SpectrogramWindow;
  bounds: SpectrogramWindow;
  setWindow: Dispatch<SetStateAction<SpectrogramWindow>>;
  shiftWindow: ShiftWindowFn;
  centerOn: CenterWindowFn;
  scaleWindow: ScaleWindowFn;
  reset: () => void;
}

/** Hook to manage a window and its bounds.
 * @param {Object} options
 * @param {SpectrogramWindow} options.initial: Initial value of the window.
 * @param {SpectrogramWindow} options.bounds: Bounds of the window.
 * @returns {WindowState} The state of the window and functions to
 * manipulate it.
 */
export default function useWindow({
  initial,
  bounds,
}: {
  initial: SpectrogramWindow;
  bounds: SpectrogramWindow;
}): WindowState {
  // Initialize window to initial value
  const [window, setWindowRaw] = useState<SpectrogramWindow>(initial);

  // Modify setWindow to adjust the window to the bounds when the window is set
  const setWindow = useCallback(
    (action: SetStateAction<SpectrogramWindow>) => {
      if (bounds == null) {
        setWindowRaw(action);
      } else if (typeof action === "function") {
        const wrapped = (win: SpectrogramWindow) => {
          const newState = action(win);
          return adjustWindowToBounds(newState, bounds);
        };

        setWindowRaw(wrapped);
      } else {
        setWindowRaw(adjustWindowToBounds(action, bounds));
      }
    },
    [bounds],
  );

  const reset = useCallback(() => {
    setWindow(initial);
  }, [setWindow, initial]);

  // Reset to initial window when changed
  useEffect(() => {
    setWindow(initial);
  }, [setWindow, initial]);

  const shift = useCallback(
    (shiftBy: { time: number; freq: number }, relative = true) => {
      setWindow((win) => shiftWindow(win, shiftBy, relative));
    },
    [setWindow],
  );

  const centerOn = useCallback(
    ({ time, freq }: { time?: number; freq?: number }) => {
      setWindow((win) => centerWindowOn(win, { time, freq }));
    },
    [setWindow],
  );

  const scale = useCallback(
    ({ time = 1, freq = 1 }: { time?: number; freq?: number } = {}) => {
      setWindow((win) => scaleWindow(win, { time, freq }));
    },
    [setWindow],
  );

  return {
    window,
    setWindow,
    shiftWindow: shift,
    centerOn,
    scaleWindow: scale,
    bounds,
    reset,
  };
}
