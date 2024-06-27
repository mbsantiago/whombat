import {
  getWindowDuration,
  getWindowCenter,
  calculateSpectrogramChunkIntervals,
  MININUM_WINDOW_SIZE,
  MAXIMUM_WINDOW_SIZE,
  DESIRED_VIEWPORT_COVERAGE,
  WINDOW_SIZES,
  SPECTROGRAM_CHUNK_OVERLAP,
  SPECTROGRAM_CHUNK_SIZE,
} from "./spectrogram_segments";
import type {
  SpectrogramWindow,
  Recording,
  AudioSettings,
  SpectrogramSettings,
} from "@/types";

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
  const recording: Recording = {
    duration: 10,
    samplerate: 44100,
    channels: 1,
    time_expansion: 1,
    created_on: new Date(),
    path: "test-path",
    hash: "test-hash",
    uuid: "test-uuid",
  };
  const spectrogramSettings: SpectrogramSettings = {
    window_size: 512,
    hop_size: 0.5,
    window: "hann",
    clamp: false,
    normalize: false,
    cmap: "viridis",
    pcen: false,
    scale: "dB",
    max_dB: 0,
    min_dB: -80,
  };
  const audioSettings: AudioSettings = {
    channel: 0,
    resample: false,
    filter_order: 4,
    speed: 1,
  };

  it("generates intervals that cover the entire recording duration", () => {
    const intervals = calculateSpectrogramChunkIntervals({
      recording,
      audioSettings,
      spectrogramSettings,
    });

    // Check if the last interval's max value is greater than or equal to the recording duration
    expect(intervals[intervals.length - 1].max).toBeGreaterThanOrEqual(
      recording.duration,
    );
  });

  it("maintains the correct overlap between consecutive intervals", () => {
    const intervals = calculateSpectrogramChunkIntervals({
      recording,
      audioSettings,
      spectrogramSettings,
    });

    for (let i = 1; i < intervals.length; i++) {
      const currentInterval = intervals[i];
      const previousInterval = intervals[i - 1];
      const overlap = previousInterval.max - currentInterval.min;

      // Check if the overlap matches the expected overlap based on SPECTROGRAM_CHUNK_OVERLAP
      const expectedOverlap =
        SPECTROGRAM_CHUNK_OVERLAP * (currentInterval.max - currentInterval.min);
      expect(overlap).toBeCloseTo(expectedOverlap); // Use toBeCloseTo for floating-point comparison
    }
  });

  it("handles resampling correctly", () => {
    const audioSettingsTest: AudioSettings = {
      ...audioSettings,
      resample: true,
      samplerate: 22050,
    };

    const intervals = calculateSpectrogramChunkIntervals({
      recording,
      audioSettings: audioSettingsTest,
      spectrogramSettings,
    });

    // Adjust expected calculations based on the resampled samplerate
    const approxSpecHeight =
      (spectrogramSettings.window_size * audioSettingsTest.samplerate!) / 2;
    const approxSpecWidth = SPECTROGRAM_CHUNK_SIZE / approxSpecHeight;
    const chunkDuration =
      approxSpecWidth *
      (1 - spectrogramSettings.hop_size) *
      spectrogramSettings.window_size;
    const chunkHop = chunkDuration * (1 - SPECTROGRAM_CHUNK_OVERLAP);
    const expectedIntervalCount = Math.ceil(recording.duration / chunkHop);

    expect(intervals.length).toBe(expectedIntervalCount);
  });

  // Additional Test Cases
  it("returns an empty array if recording duration is zero", () => {
    const recordingTest: Recording = {
      ...recording,
      duration: 0,
    };

    const intervals = calculateSpectrogramChunkIntervals({
      recording: recordingTest,
      audioSettings,
      spectrogramSettings,
    });
    expect(intervals).toEqual([]);
  });
});
