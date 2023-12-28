import { type Interval } from "@/api/audio";
import {
  type SpectrogramWindow,
  type SpectrogramParameters,
  DEFAULT_WINDOW_SIZE,
  DEFAULT_SPECTROGRAM_PARAMETERS,
  DEFAULT_HOP_SIZE,
} from "@/api/spectrograms";

// Size of the target initial spectrogram in pixels.
const TARGET_INITIAL_SIZE = 512 * 1024;

export function getInitialViewingWindow({
  startTime,
  endTime,
  samplerate,
  parameters = DEFAULT_SPECTROGRAM_PARAMETERS,
}: {
  startTime: number;
  endTime: number;
  samplerate: number;
  parameters?: SpectrogramParameters;
}): SpectrogramWindow {
  const duration = getInitialDuration({
    interval: { min: startTime, max: endTime },
    samplerate,
    window_size: parameters.window_size,
    hop_size: parameters.hop_size,
  });
  return {
    time: { min: startTime, max: startTime + duration },
    freq: { min: 0, max: samplerate / 2 },
  };
}

/**
 * Get the ideal duration of a spectrogram window given the interval and
 * samplerate of the audio.
 * The ideal duration is a balance between:
 * - A large window that provides a good overview of the recording.
 * - A small window for which the spectrogram computation is fast.
 * Since the spectrogram computation is O(n^2) in the window size, we want to
 * avoid huge windows.
 */
export function getInitialDuration({
  interval,
  samplerate,
  window_size = DEFAULT_WINDOW_SIZE,
  hop_size = DEFAULT_HOP_SIZE,
}: {
  interval: Interval;
  samplerate: number;
  window_size?: number;
  hop_size?: number;
}) {
  console.log({
    interval,
    samplerate,
    window_size,
    hop_size,
  })
  const duration = interval.max - interval.min;
  const n_fft = Math.floor(window_size * samplerate);
  const specHeight = Math.floor(n_fft / 2) + 1;
  const specWidth = TARGET_INITIAL_SIZE / specHeight;
  const hopDuration = window_size * hop_size;
  const windowWidth = specWidth * hopDuration;
  return Math.min(duration, windowWidth);
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

export function scaleWindow(
  window: SpectrogramWindow,
  { time = 1, freq = 1 }: { time?: number; freq?: number } = {},
): SpectrogramWindow {
  const width = (window.time.max - window.time.min) * time;
  const height = (window.freq.max - window.freq.min) * freq;
  const timeCenter = (window.time.max + window.time.min) / 2;
  const freqCenter = (window.freq.max + window.freq.min) / 2;
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
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(Math.round(value), min), max);
}

export function getViewportPosition({
  width,
  height,
  viewport,
  bounds,
}: {
  width?: number;
  height?: number;
  viewport: SpectrogramWindow;
  bounds: SpectrogramWindow;
}): {
  left: number;
  width: number;
  top: number;
  height: number;
} {
  if (width == null || height == null) {
    return { left: 0, width: 0, top: 0, height: 0 };
  }

  const bottom =
    (bounds.freq.max - viewport.freq.min) / (bounds.freq.max - bounds.freq.min);
  const top =
    (bounds.freq.max - viewport.freq.max) / (bounds.freq.max - bounds.freq.min);
  const left =
    (viewport.time.min - bounds.time.min) / (bounds.time.max - bounds.time.min);
  const right =
    (viewport.time.max - bounds.time.min) / (bounds.time.max - bounds.time.min);
  return {
    top: clamp(top * height, 0, height),
    left: clamp(left * width, 0, width),
    height: clamp((bottom - top) * height, 0, height),
    width: clamp((right - left) * width, 0, width),
  };
}
