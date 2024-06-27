import type {
  SpectrogramWindow,
  Recording,
  AudioSettings,
  SpectrogramSettings,
  Interval,
} from "@/types";

const SAMPLE_HEIGHT = 128;

/**
 * The size in pixels of a spectrogram chunk.
 */
export const SPECTROGRAM_CHUNK_SIZE = 256 * 256;

/**
 * The overlap fraction between consecutive spectrogram chunks.
 */
export const SPECTROGRAM_CHUNK_BUFFER = 0.1;

/**
 * The minimum size (in pixels) of a requested spectrogram window.
 *
 * This value is chosen to provide a reasonable initial resolution while
 * avoiding excessively small windows. At a sample rate of 44.1 kHz, a window
 * size of 512 samples, and a hop size of 256 samples, this size corresponds to
 * approximately 0.75 seconds of audio.
 */
export const MININUM_WINDOW_SIZE = SAMPLE_HEIGHT * 128;

/**
 * The maximum size (in pixels) of a requested spectrogram window.
 *
 * This value limits the maximum duration of a single window, preventing the
 * request for overly large spectrograms that might be computationally
 * expensive or slow to load.  At a sample rate of 44.1 kHz, a window size of
 * 512 samples, and a hop size of 256 samples, this size corresponds to
 * approximately 190 seconds of audio.
 */
export const MAXIMUM_WINDOW_SIZE = SAMPLE_HEIGHT * 32768;

/**
 * The target number of viewport durations to cover with a single spectrogram
 * window.
 *
 * This factor determines how much of the visible time range should be included
 * in each spectrogram request. A higher value means fewer requests overall,
 * but potentially larger individual requests.
 */
export const DESIRED_VIEWPORT_COVERAGE = 3;

/**
 * An array of possible spectrogram window sizes (in pixels).
 *
 * These values define the discrete sizes at which spectrograms can be
 * requested. The array MUST be sorted in ascending order and MUST include both
 * `MINIMUM_WINDOW_SIZE` and `MAXIMUM_WINDOW_SIZE`.
 */
export const WINDOW_SIZES = [
  MININUM_WINDOW_SIZE,
  SAMPLE_HEIGHT * 256,
  SAMPLE_HEIGHT * 512,
  SAMPLE_HEIGHT * 1024,
  SAMPLE_HEIGHT * 2048,
  SAMPLE_HEIGHT * 4096,
  SAMPLE_HEIGHT * 8192,
  SAMPLE_HEIGHT * 16384,
  MAXIMUM_WINDOW_SIZE,
];

/**
 * The overlap fraction between consecutive fetched spectrogram windows.
 *
 * This value (between 0 and 1) determines how much overlap there is between
 * adjacent spectrogram windows. A fixed overlap of 40% is used to increase the
 * likelihood of caching and reusing the same spectrogram windows when the
 * viewport shifts slightly.
 */
export const WINDOW_OVERLAP = 1 / 3;

/**
 * Calculates the optimal duration for a spectrogram window request.
 *
 * This function determines the ideal window duration based on:
 *   - The current viewport (time range of interest).
 *   - The audio sample rate.
 *   - Spectrogram parameters (window size and overlap).
 *
 * The goal is to ensure the window covers a sufficient portion of the viewport
 * (at least `DESIRED_VIEWPORT_COVERAGE` times the viewport duration) while
 * adhering to minimum (`MINIMUM_WINDOW_SIZE`) and maximum
 * (`MAXIMUM_WINDOW_SIZE`) size constraints.
 *
 * Note: The function assumes the provided `WINDOW_SIZES` array is sorted in
 * ascending order.
 *
 * @param {SpectrogramWindow} viewport - The current viewport.
 * @param {number} samplerate - The audio sample rate in Hz.
 * @param {number} windowSize - The size of each spectrogram window (in
 * samples).
 * @param {number} overlap - The overlap between consecutive windows (as a
 * fraction between 0 and 1).
 * @returns {number} The calculated optimal duration for the spectrogram window
 * (in seconds).
 */
export function getWindowDuration(
  viewport: SpectrogramWindow,
  samplerate: number,
  windowSize: number,
  overlap: number,
  desiredCoverage: number = DESIRED_VIEWPORT_COVERAGE,
  minimumSize: number = MININUM_WINDOW_SIZE,
  maximumSize: number = MAXIMUM_WINDOW_SIZE,
  windowSizes: number[] = WINDOW_SIZES,
): number {
  const viewportDuration = viewport.time.max - viewport.time.min;

  // Spectrogram size calculation (approximate)
  const approximateSpectrogramHeight = (samplerate * windowSize) / 2;

  // Calculation of bins per second given overlap and window size.
  const timeBinsPerSecond = 1 / (windowSize * (1 - overlap));

  // Calculate the size of the spectrogram window per second.
  const sizePerSecond =
    desiredCoverage * approximateSpectrogramHeight * timeBinsPerSecond;

  const targetSize = viewportDuration * sizePerSecond;

  let size = Math.max(minimumSize, Math.min(maximumSize, targetSize));
  size = windowSizes.find((d) => d >= size) ?? maximumSize;

  const width = size / approximateSpectrogramHeight;
  const duration = width / timeBinsPerSecond;
  return duration;
}

/**
 * Calculates the optimal center time for a spectrogram window request.
 *
 * This function determines the best center time for the window based on:
 *   - The current viewport (time range of interest).
 *   - The duration of the spectrogram window.
 *
 * The ideal center is as close as possible to the viewport's center. However,
 * it's constrained to be a multiple of the hop size (the distance the window
 * shifts between calculations). Additionally, the center is offset by half
 * the window duration to keep the window's start aligned with the beginning of
 * the recording.
 *
 * @param {SpectrogramWindow} viewport - The current viewport.
 * @param {number} windowDuration - The duration of the spectrogram window in
 * seconds.
 * @returns {number} The calculated optimal center time for the spectrogram
 * window in seconds.
 */
export function getWindowCenter(
  viewport: SpectrogramWindow,
  windowDuration: number,
  windowOverlap: number = WINDOW_OVERLAP,
): number {
  const viewportCenter = (viewport.time.min + viewport.time.max) / 2;
  const hopSize = (1 - windowOverlap) * windowDuration;
  const offset = windowDuration / 2;
  return (
    Math.max(0, Math.round((viewportCenter - offset) / hopSize) * hopSize) +
    offset
  );
}

/**
 * Calculates the time intervals for spectrogram chunks based on recording and
 * settings.
 */
export function calculateSpectrogramChunkIntervals({
  duration,
  windowSize,
  overlap,
  samplerate,
  chunkSize = SPECTROGRAM_CHUNK_SIZE,
  chunkBuffer = SPECTROGRAM_CHUNK_BUFFER,
}: {
  /** The duration of the recording in seconds. */
  duration: number;
  /** The duration of each STFT window in seconds. */
  windowSize: number;
  /** The overlap fraction between consecutive windows. */
  overlap: number;
  /** The audio sample rate in Hz. */
  samplerate: number;
  /** The size of each spectrogram chunk in pixels. */
  chunkSize?: number;
  /** The overlap fraction between consecutive chunks. */
  chunkBuffer?: number;
}): Interval[] {
  const approxSpecHeight = (windowSize * samplerate) / 2;
  const approxSpecWidth = chunkSize / approxSpecHeight;
  const chunkDuration = approxSpecWidth * (1 - overlap) * windowSize;
  return Array.from({ length: Math.ceil(duration / chunkDuration) }, (_, i) => {
    return {
      min: i * chunkDuration - chunkBuffer,
      max: (i + 1) * chunkDuration + chunkBuffer,
    };
  });
}
