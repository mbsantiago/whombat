import {
  getWindowDuration,
  getWindowCenter,
  MININUM_WINDOW_SIZE,
  MAXIMUM_WINDOW_SIZE,
  WINDOW_OVERLAP,
  DESIRED_VIEWPORT_COVERAGE,
  WINDOW_SIZES,
} from "./useRecordingSpectrogram";
import type { SpectrogramWindow } from "@/types";

describe("getWindowDuration", () => {
  it("covers the viewport when in range", () => {
    const viewport: SpectrogramWindow = {
      time: { min: 0, max: 10 },
      freq: { min: 0, max: 22050 },
    }; // 10 second viewport
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
    }; // Very short viewport
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
    }; // Very long viewport
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

    // Example targetSize falling between two sizes in WINDOW_SIZES
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
