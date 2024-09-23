import { DEFAULT_SPECTROGRAM_PARAMETERS } from "@/lib/api/spectrograms";
import { DEFAULT_OVERLAP, DEFAULT_WINDOW_SIZE } from "@/lib/constants";
import type {
  Geometry,
  Interval,
  Position,
  Recording,
  SpectrogramParameters,
  SpectrogramWindow,
} from "@/lib/types";

import { computeGeometryBBox } from "./geometry";

/** Size of the target initial spectrogram in pixels. */
const TARGET_INITIAL_SIZE = 512 * 1024;

/** Minimum window bandwidth in Hz. */
const MIN_WINDOW_BANDWIDTH = 0.1;

/** Minimum window duration in seconds */
const MIN_WINDOW_DURATION = 0.001;

export function getInitialViewingWindow({
  startTime,
  endTime,
  samplerate,
  windowSize,
  overlap,
}: {
  startTime: number;
  endTime: number;
  samplerate: number;
  windowSize: number;
  overlap: number;
}): SpectrogramWindow {
  const duration = getInitialDuration({
    interval: { min: startTime, max: endTime },
    samplerate,
    windowSize: windowSize,
    overlap,
  });
  return {
    time: { min: startTime, max: startTime + duration },
    freq: { min: 0, max: samplerate / 2 },
  };
}

export function getGeometryViewingWindow({
  geometry,
  recording,
  timeBuffer = 1,
  freqBuffer = null,
}: {
  geometry: Geometry;
  recording: Recording;
  timeBuffer?: number;
  freqBuffer?: number | null;
}): SpectrogramWindow {
  const [startTime, lowFreq, endTime, highFreq] = computeGeometryBBox(geometry);
  const maxFreq = recording.samplerate / 2;

  const freq =
    freqBuffer == null
      ? {
          min: 0,
          max: maxFreq,
        }
      : {
          min: Math.max(lowFreq - freqBuffer),
          max: Math.min(highFreq + freqBuffer, maxFreq),
        };

  return {
    time: {
      min: Math.max(startTime - timeBuffer, 0),
      max: Math.min(endTime + timeBuffer, recording.duration),
    },
    freq,
  };
}

export function getCenteredViewingWindow({
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
  const center = (startTime + endTime) / 2;
  const duration = getInitialDuration({
    interval: {
      min: startTime,
      max: endTime,
    },
    samplerate,
    windowSize: parameters.window_size,
    overlap: parameters.overlap,
  });
  return {
    time: { min: center - duration / 2, max: center + duration / 2 },
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
  windowSize = DEFAULT_WINDOW_SIZE,
  overlap = DEFAULT_OVERLAP,
}: {
  interval: Interval;
  samplerate: number;
  windowSize?: number;
  overlap?: number;
}) {
  const duration = interval.max - interval.min;
  const n_fft = Math.floor(windowSize * samplerate);
  const specHeight = Math.floor(n_fft / 2) + 1;
  const specWidth = TARGET_INITIAL_SIZE / specHeight;
  const hopDuration = windowSize * (1 - overlap);
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
  let duration = window.time.max - window.time.min;
  let bandwidth = window.freq.max - window.freq.min;

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

  duration = Math.max(duration, MIN_WINDOW_DURATION);
  bandwidth = Math.max(bandwidth, MIN_WINDOW_BANDWIDTH);

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

export function expandWindow(
  window: SpectrogramWindow,
  { time = 0, freq = 0 }: { time?: number; freq?: number } = {},
): SpectrogramWindow {
  return {
    time: {
      min: window.time.min - time,
      max: window.time.max + time,
    },
    freq: {
      min: window.freq.min - freq,
      max: window.freq.max + freq,
    },
  };
}

export function zoomWindowToPosition(
  window: SpectrogramWindow,
  position: Position,
  factor: number = 1,
): SpectrogramWindow {
  return {
    time: {
      min: factor * window.time.min + (1 - factor) * position.time,
      max: factor * window.time.max + (1 - factor) * position.time,
    },
    freq: {
      min: factor * window.freq.min + (1 - factor) * position.freq,
      max: factor * window.freq.max + (1 - factor) * position.freq,
    },
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
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
