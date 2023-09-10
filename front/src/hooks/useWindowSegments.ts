import { useState, useEffect, useMemo } from "react";
import { type Interval } from "@/api/audio";
import { type SpectrogramWindow } from "@/api/spectrograms";

const MIN_DURATION = 0.5;
const MAX_DURATION = 60 * 5;

interface UseSpectrogramWindowProps {
  window: SpectrogramWindow;
  bounds: SpectrogramWindow;
  minDuration?: number;
  maxDuration?: number;
}

function getWindowNeighborhoodDimensions(
  window: SpectrogramWindow,
  minDuration = MIN_DURATION,
  maxDuration = MAX_DURATION,
): number {
  const duration = (window.time.max - window.time.min) * 1.1;
  const exponent = Math.floor(Math.log2(duration)) + 3;
  return Math.min(Math.max(2 ** exponent, minDuration), maxDuration);
}

function getSegments(
  bounds: SpectrogramWindow,
  duration: number,
  hop: number,
): Interval[] {
  const fullDuration = bounds.time.max - bounds.time.min;
  const numSegments = Math.ceil((fullDuration - hop) / hop);
  return Array(numSegments)
    .fill(0)
    .map((_, index: number) => {
      const start = bounds.time.min + index * hop;
      return {
        min: start,
        max: start + duration,
      };
    });
}

export default function useWindowSegments({
  window,
  bounds,
  minDuration = MIN_DURATION,
  maxDuration = MAX_DURATION,
}: UseSpectrogramWindowProps): { segments: Interval[]; selected: number } {
  const [selected, setSelected] = useState<number>(0);

  const segments = useMemo(() => {
    // Compute the size of the segments
    const dimensions = Math.min(
      getWindowNeighborhoodDimensions(window, minDuration, maxDuration),
      bounds.time.max - bounds.time.min,
    );
    const hop = dimensions / 2;
    return getSegments(bounds, dimensions, hop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    bounds.time.min,
    bounds.time.max,
    window.time.min,
    window.time.max,
    minDuration,
    maxDuration,
  ]);

  // Reset selected segment whenever segments change
  useEffect(() => {
    if (segments.length > 0) {
      setSelected(0);
    }
  }, [segments.length]);

  // Change selected segment if necessary
  useEffect(() => {
    const selectedSegment = segments[selected];

    if (selectedSegment != null) {
      // Reselect the segment if the window is not fully contained
      if (
        window.time.min < selectedSegment.min ||
        window.time.max > selectedSegment.max
      ) {
        // Select the first segment that contains the window
        const ret = segments.some((segment, index) => {
          if (segment.min >= window.time.min) {
            setSelected(Math.max(index - 1, 0));
            return true;
          }
          return false;
        });

        if (!ret) setSelected(segments.length - 1);
      }
    }
  }, [window.time.min, window.time.max, segments, selected]);

  return {
    segments,
    selected: Math.min(selected, segments.length - 1),
  };
}
