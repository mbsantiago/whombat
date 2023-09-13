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

import {
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";
import { type Interval } from "@/api/audio";
import { type SpectrogramWindow } from "@/api/spectrograms";

export type ShiftWindowFn = (
  shiftBy: { time: number; freq: number },
  relative: boolean,
) => void;

export type SetWindowFn = Dispatch<SetStateAction<SpectrogramWindow>>;

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

/**
 * Compute the intersection of two intervals
 */
export function intersectIntervals(
  interval1: Interval,
  interval2: Interval,
): Interval | null {
  const { min: min1, max: max1 } = interval1;
  const { min: min2, max: max2 } = interval2;

  const min = Math.max(min1, min2);
  const max = Math.min(max1, max2);

  if (min > max) return null;
  return { min, max };
}

/**
 * Compute the intersection of two spectrogram windows
 */
export function intersectWindows(
  window1: SpectrogramWindow,
  window2: SpectrogramWindow,
): SpectrogramWindow | null {
  const timeIntersection = intersectIntervals(window1.time, window2.time);
  const freqIntersection = intersectIntervals(window1.freq, window2.freq);

  if (timeIntersection == null || freqIntersection == null) return null;
  return {
    time: timeIntersection,
    freq: freqIntersection,
  };
}

/**
 * Extend a spectrogram window in the time an frequency axis.
 * @param {SpectrogramWindow} window: Spectrogram window to extend.
 * @param {{time: number, freq: number}} expandBy: The amount of extension in
 * each axis. The extension can be negative and thus contract the original
 * window.
 */
export function extendWindow(
  window: SpectrogramWindow,
  expandBy: { time: number; freq: number },
): SpectrogramWindow {
  const { time, freq } = expandBy;
  return {
    time: { min: window.time.min - time, max: window.time.max + time },
    freq: { min: window.freq.min - freq, max: window.freq.max + freq },
  };
}

export function getWindowDimensions(window: SpectrogramWindow): {
  time: number;
  freq: number;
} {
  return {
    time: window.time.max - window.time.min,
    freq: window.freq.max - window.freq.min,
  };
}

/**
 * Adjust spectrogram window to given bounds
 * @param {SpectrogramWindow} window: Spectrogram window to adjust.
 * @param {SpectrogramWindow} bounds: Spectrogram window to use as bounds for
 * the given window.
 */
export function adjustWindowToBounds(
  window: SpectrogramWindow,
  bounds: SpectrogramWindow,
): SpectrogramWindow {
  const duration = window.time.max - window.time.min;
  const bandwidth = window.freq.max - window.freq.min;

  const centerTime = (window.time.max + window.time.min) / 2;
  const centerFreq = (window.freq.max + window.freq.min) / 2;

  const adjustedCenterTime = Math.min(
    Math.max(centerTime, bounds.time.min + duration / 2),
    bounds.time.max - duration / 2,
  );

  const adjustedCenterFreq = Math.min(
    Math.max(centerFreq, bounds.freq.min + bandwidth / 2),
    bounds.freq.max - bandwidth / 2,
  );

  const adjustedWindow = {
    time: {
      min: adjustedCenterTime - duration / 2,
      max: adjustedCenterTime + duration / 2,
    },
    freq: {
      min: adjustedCenterFreq - bandwidth / 2,
      max: adjustedCenterFreq + bandwidth / 2,
    },
  };

  return intersectWindows(adjustedWindow, bounds) as SpectrogramWindow;
}

export function shiftWindow(
  window: SpectrogramWindow,
  shiftBy: { time: number; freq: number },
  relative = true,
): SpectrogramWindow {
  let { time, freq } = shiftBy;

  if (relative) {
    const { time: timeDims, freq: freqDims } = getWindowDimensions(window);
    time *= timeDims;
    freq *= freqDims;
  }

  return {
    time: { min: window.time.min + time, max: window.time.max + time },
    freq: { min: window.freq.min + freq, max: window.freq.max + freq },
  };
}

export function centerWindowOn(
  window: SpectrogramWindow,
  { time, freq }: { time?: number; freq?: number },
): SpectrogramWindow {
  const width = window.time.max - window.time.min;
  const height = window.freq.max - window.freq.min;
  const timeMin = time != null ? time - width / 2 : window.time.min;
  const timeMax = time != null ? time + width / 2 : window.time.max;
  const freqMin = freq != null ? freq - height / 2 : window.freq.min;
  const freqMax = freq != null ? freq + height / 2 : window.freq.max;
  return {
    time: {
      min: timeMin,
      max: timeMax,
    },
    freq: {
      min: freqMin,
      max: freqMax,
    },
  };
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

  const scaleWindow = useCallback(
    ({ time = 1, freq = 1 }: { time?: number; freq?: number } = {}) => {
      setWindow((win) => {
        const width = (win.time.max - win.time.min) * time;
        const height = (win.freq.max - win.freq.min) * freq;
        const timeCenter = (win.time.max + win.time.min) / 2;
        const freqCenter = (win.freq.max + win.freq.min) / 2;
        return {
          time: {
            min: timeCenter - width / 2,
            max: timeCenter + width / 2,
          },
          freq: {
            min: freqCenter - height / 2,
            max: freqCenter + height / 2,
          },
        };
      });
    },
    [setWindow],
  );

  return {
    window,
    setWindow,
    shiftWindow: shift,
    centerOn,
    scaleWindow,
    bounds,
    reset,
  };
}
