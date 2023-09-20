import { useMemo } from "react";

import { type SpectrogramWindow } from "@/api/spectrograms";
import { type Recording } from "@/api/recordings";

// Sizes of the segments
const DURATIONS = [0.125, 0.25, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256];
const OVERLAP = 0.4;

export default function useRecordingSegments({
  recording,
  window,
}: {
  recording: Recording;
  window: SpectrogramWindow;
}) {
  // The bounds of the spectrogram
  const bounds = useMemo(
    () => ({
      time: { min: 0, max: recording.duration },
      freq: { min: 0, max: recording.samplerate / 2 },
    }),
    [recording],
  );

  // Compute the segments that cover the window
  const segments = useMemo(() => {
    const duration = getCoveringSegmentDuration(window);
    const segments = getSegments(bounds, duration, OVERLAP);
    return segments;
  }, [bounds, window]);

  // Select the segment that best covers the window
  const indexSelected = useMemo(
    () => getCoveringSegment(segments, window),
    [segments, window],
  );

  // Compute the neighbors of the selected segment
  const { prev, next } = useMemo(() => {
    const prev = segments[indexSelected - 1] ?? segments[indexSelected];
    const next = segments[indexSelected + 1] ?? segments[indexSelected];
    return {
      prev,
      next,
    };
  }, [segments, indexSelected]);

  // Return the selected segment and its neighbors
  const selected = useMemo(
    () => segments[indexSelected],
    [segments, indexSelected],
  );

  return {
    selected,
    prev,
    next,
  };
}

/** Compute the minimum segment duration that covers the given window. */
function getCoveringSegmentDuration(window: SpectrogramWindow) {
  const duration = window.time.max - window.time.min;
  return (
    DURATIONS.find((d) => d >= 3 * duration) ?? DURATIONS[DURATIONS.length - 1]
  );
}

/** Segment a window into overlapping segments of a given duration. */
function getSegments(
  window: SpectrogramWindow,
  duration: number,
  overlap: number,
): SpectrogramWindow[] {
  const fullDuration = window.time.max - window.time.min;

  // If the window is smaller than the segment duration, return
  // the whole window
  if (fullDuration <= duration) {
    return [
      {
        time: window.time,
        freq: window.freq,
      }
    ]
  }

  const hop = duration * (1 - overlap);
  const numSegments = Math.ceil((fullDuration - hop) / hop);
  return Array(numSegments)
    .fill(0)
    .map((_, index: number) => {
      const start = window.time.min + index * hop;
      return {
        time: {
          min: start,
          max: start + duration,
        },
        freq: window.freq,
      };
    });
}

/** Select the index of the segment that best covers the given window. */
function getCoveringSegment(
  segments: SpectrogramWindow[],
  window: SpectrogramWindow,
): number {
  const distances = segments.map((segment) => {
    const segmentCenter = (segment.time.min + segment.time.max) / 2;
    const windowCenter = (window.time.min + window.time.max) / 2;
    return Math.abs(segmentCenter - windowCenter);
  });

  return argMin(distances);
}

/**
 * Return the index of the min value in the array.
 * Taken from: https://stackoverflow.com/a/11301464
 */
function argMin(arr: number[]): number {
  if (arr.length === 0) {
    return -1;
  }

  let min = arr[0];
  let minIndex = 0;

  for (var i = 1; i < arr.length; i++) {
    if (arr[i] < min) {
      minIndex = i;
      min = arr[i];
    }
  }

  return minIndex;
}
