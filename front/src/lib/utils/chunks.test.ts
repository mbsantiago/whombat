import { calculateSpectrogramChunkIntervals } from "./chunks";

describe("calculateSpectrogramChunkIntervals", () => {
  const duration = 10;
  const samplerate = 44100;
  const overlap = 0.5;
  const windowSize = 0.02;
  const chunkSize = 256 * 256;
  const chunkBuffer = 0.1;

  it("generates intervals that cover the entire recording duration", () => {
    const chunks = calculateSpectrogramChunkIntervals({
      duration,
      windowSize,
      overlap,
      samplerate,
      chunkSize,
      chunkBuffer,
    });

    expect(chunks[chunks.length - 1].buffer.max).toBeGreaterThanOrEqual(
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

    intervals.forEach(({ interval }) => {
      // Make sure that intervals are of the correct duration
      expect(interval.max - interval.min).toBeCloseTo(targetDuration);
    });
  });

  it("adds a buffer to the chunk size", () => {
    const targetWidth = 100;
    const targetHeight = 50;
    const duration = 10000;
    const chunkBuffer = 3;
    const windowSize = targetHeight * 2;

    const intervals = calculateSpectrogramChunkIntervals({
      duration,
      windowSize,
      overlap,
      samplerate: 1,
      chunkSize: targetWidth * targetHeight,
      chunkBuffer,
    });

    const hopSize = windowSize * (1 - overlap);
    const secsPerBin = targetHeight * 2 * (1 - overlap);
    const targetDuration = targetWidth * secsPerBin;

    // This translates to windowSize stft windows
    const bufferWidth = (chunkBuffer - 1) * hopSize + windowSize;

    intervals.forEach(({ buffer }) => {
      expect(buffer.max - buffer.min).toBeCloseTo(
        targetDuration + 2 * bufferWidth,
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

    intervals.forEach(({ interval }) => {
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
