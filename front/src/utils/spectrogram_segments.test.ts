import {
  getWindowDuration,
  getWindowCenter,
  calculateSpectrogramChunkIntervals,
  MININUM_WINDOW_SIZE,
  MAXIMUM_WINDOW_SIZE,
  DESIRED_VIEWPORT_COVERAGE,
  WINDOW_SIZES,
} from "./spectrogram_segments";
import type { SpectrogramWindow } from "@/types";

describe("getWindowDuration", () => {
  it("covers the viewport when in range", () => {
    const viewport: SpectrogramWindow = {
      time: { min: 0, max: 10 },
      freq: { min: 0, max: 22050 },
    };
    const samplerate = 44100;
    const windowSize = 512;
    const overlap = 0.5;

    const result = getWindowDuration(viewport, samplerate, windowSize, overlap);
    expect(result).toBeGreaterThanOrEqual(DESIRED_VIEWPORT_COVERAGE * 10);
    expect(result).toBeLessThanOrEqual(2 * DESIRED_VIEWPORT_COVERAGE * 10);
  });

  it("clamps the duration to the minimum when the target is too small", () => {
    const viewport: SpectrogramWindow = {
      time: { min: 0, max: 0.1 },
      freq: { min: 0, max: 22050 },
    };
    const samplerate = 44100;
    const windowSize = 512;
    const overlap = 0.5;

    const expectedDuration =
      MININUM_WINDOW_SIZE /
      ((samplerate * windowSize) / 2) /
      (1 / (windowSize * (1 - overlap)));

    const result = getWindowDuration(viewport, samplerate, windowSize, overlap);
    expect(result).toBeCloseTo(expectedDuration);
  });

  it("clamps the duration to the maximum when the target is too large", () => {
    const viewport: SpectrogramWindow = {
      time: { min: 0, max: 1000 },
      freq: { min: 0, max: 22050 },
    };
    const samplerate = 44100;
    const windowSize = 512;
    const overlap = 0.5;

    const expectedDuration =
      MAXIMUM_WINDOW_SIZE /
      ((samplerate * windowSize) / 2) /
      (1 / (windowSize * (1 - overlap)));

    const result = getWindowDuration(viewport, samplerate, windowSize, overlap);
    expect(result).toBeCloseTo(expectedDuration);
  });

  it("selects the next largest duration from WINDOW_SIZES", () => {
    const viewport: SpectrogramWindow = {
      time: { min: 0, max: 5 },
      freq: { min: 0, max: 22050 },
    };
    const samplerate = 44100;
    const windowSize = 512;
    const overlap = 0.5;

    const targetSize = 256 * 3000;
    const expectedSize = WINDOW_SIZES.find((d) => d >= targetSize)!; // Find the next largest size
    const expectedDuration =
      expectedSize /
      ((samplerate * windowSize) / 2) /
      (1 / (windowSize * (1 - overlap)));

    const result = getWindowDuration(viewport, samplerate, windowSize, overlap);
    expect(result).toBeCloseTo(expectedDuration);
  });
});

describe("getWindowCenter", () => {
  it("calculates the center time correctly when viewport center aligns with hop size", () => {
    const viewport: SpectrogramWindow = {
      time: { min: 0, max: 10 },
      freq: { min: 0, max: 22050 },
    };
    const windowDuration = 2;
    const windowOverlap = 0.5;

    // Viewport center perfectly aligns with hop size multiple
    expect(getWindowCenter(viewport, windowDuration, windowOverlap)).toBe(5);
  });

  it("adjusts the center time to the nearest hop size multiple", () => {
    const viewport: SpectrogramWindow = {
      time: { min: 0, max: 10 },
      freq: { min: 0, max: 22050 },
    };
    const windowDuration = 3;
    const windowOverlap = 0.5;

    // Viewport center is between hop size multiples
    expect(getWindowCenter(viewport, windowDuration, windowOverlap)).toBe(4.5);
  });

  it("ensures the window starts at the beginning of the recording", () => {
    const viewport: SpectrogramWindow = {
      time: { min: 0, max: 1 },
      freq: { min: 0, max: 22050 },
    };
    const windowDuration = 2;
    const windowOverlap = 0.5;

    // Viewport starts at 0, center should be half the window duration
    expect(getWindowCenter(viewport, windowDuration, windowOverlap)).toBe(1);
  });

  it("handles viewports that do not start at zero", () => {
    const viewport: SpectrogramWindow = {
      time: { min: 5, max: 15 },
      freq: { min: 0, max: 22050 },
    };
    const windowDuration = 2;
    const windowOverlap = 0.5;

    // Viewport shifted, center should be adjusted accordingly
    expect(getWindowCenter(viewport, windowDuration, windowOverlap)).toBe(10);
  });
});

describe("calculateSpectrogramChunkIntervals", () => {
  const duration = 10;
  const samplerate = 44100;
  const overlap = 0.5;
  const windowSize = 0.02;
  const chunkSize = 256 * 256;
  const chunkBuffer = 0.1;

  it("generates intervals that cover the entire recording duration", () => {
    const intervals = calculateSpectrogramChunkIntervals({
      duration,
      windowSize,
      overlap,
      samplerate,
      chunkSize,
      chunkBuffer,
    });

    expect(intervals[intervals.length - 1].max).toBeGreaterThanOrEqual(
      duration,
    );
  });

  it("generates intervals that are of the correct duration", () => {
    const targetWidth = 100;
    const targetHeight = 50;
    const duration = 10000;

    const intervals = calculateSpectrogramChunkIntervals({
      duration,
      windowSize: targetHeight * 2,
      overlap,
      samplerate: 1,
      chunkSize: targetWidth * targetHeight,
      chunkBuffer: 0,
    });

    const secsPerBin = targetHeight * 2 * (1 - overlap);
    const targetDuration = targetWidth * secsPerBin;

    intervals.forEach((interval) => {
      // Make sure that intervals are of the correct duration
      expect(interval.max - interval.min).toBeCloseTo(targetDuration);
    });
  });

  it("adds a buffer to the chunk size", () => {
    const targetWidth = 100;
    const targetHeight = 50;
    const duration = 10000;
    const chunkBuffer = 0.1;

    const intervals = calculateSpectrogramChunkIntervals({
      duration,
      windowSize: targetHeight * 2,
      overlap,
      samplerate: 1,
      chunkSize: targetWidth * targetHeight,
      chunkBuffer,
    });

    const secsPerBin = targetHeight * 2 * (1 - overlap);
    const targetDuration = targetWidth * secsPerBin;

    intervals.forEach((interval) => {
      expect(interval.max - interval.min).toBeCloseTo(
        targetDuration + 2 * chunkBuffer,
      );
    });
  });

  it("generates intervals that are aligned to the chunk size", () => {
    const targetWidth = 100;
    const targetHeight = 50;
    const duration = 10000;

    const intervals = calculateSpectrogramChunkIntervals({
      duration,
      windowSize: targetHeight * 2,
      overlap,
      samplerate: 1,
      chunkSize: targetWidth * targetHeight,
      chunkBuffer: 0,
    });

    const secsPerBin = targetHeight * 2 * (1 - overlap);
    const targetDuration = targetWidth * secsPerBin;
    const expectedChunks = duration / targetDuration;

    // Check if the number of intervals is correct
    expect(intervals.length).toBe(expectedChunks);

    intervals.forEach((interval) => {
      // Make sure that intervals are aligned to the target duration
      expect(interval.min % targetDuration).toBeCloseTo(0);
    });
  });

  // Additional Test Cases
  it("returns an empty array if recording duration is zero", () => {
    const intervals = calculateSpectrogramChunkIntervals({
      duration: 0,
      windowSize,
      overlap,
      samplerate,
      chunkSize,
      chunkBuffer,
    });
    expect(intervals).toEqual([]);
  });
});
