import { useMemo, useCallback, type RefObject } from "react";
import type {
  Recording,
  SpectrogramSettings,
  Interval,
  SpectrogramWindow,
  AudioSettings,
} from "@/types";

import drawImage from "@/draw/image";
import useImage from "@/hooks/spectrogram/useImage";

/**
 * The minimum size (in pixels) of a requested spectrogram window.
 *
 * This value is chosen to provide a reasonable initial resolution while
 * avoiding excessively small windows. At a sample rate of 44.1 kHz, a window
 * size of 512 samples, and a hop size of 256 samples, this size corresponds to
 * approximately 0.75 seconds of audio.
 */
export const MININUM_WINDOW_SIZE = 256 * 128;

/**
 * The maximum size (in pixels) of a requested spectrogram window.
 *
 * This value limits the maximum duration of a single window, preventing the
 * request for overly large spectrograms that might be computationally
 * expensive or slow to load.  At a sample rate of 44.1 kHz, a window size of
 * 512 samples, and a hop size of 256 samples, this size corresponds to
 * approximately 190 seconds of audio.
 */
export const MAXIMUM_WINDOW_SIZE = 256 * 32768;

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
  256 * 256,
  256 * 512,
  256 * 1024,
  256 * 2048,
  256 * 4096,
  256 * 8192,
  256 * 16384,
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
export const WINDOW_OVERLAP = 0.4;

export type RecordingSpectrogramInterface = {
  /** A function to draw the spectrogram on a canvas. */
  drawFn: (ctx: CanvasRenderingContext2D, viewport: SpectrogramWindow) => void;
  /** The time interval of the loaded spectrogram window. */
  interval: Interval;
  /** A reference to the HTMLImageElement containing the spectrogram image. */
  image: RefObject<HTMLImageElement>;
  /** Indicates if the spectrogram image is currently loading. */
  isLoading: boolean;
  /** Indicates if an error occurred while loading the image. */
  isError: boolean;
  /** The error object if an error occurred, otherwise null. */
  error: Error | null;
};

/**
 * A React hook for managing the display of a recording's spectrogram.
 *
 * This hook calculates the optimal window duration and center for the
 * spectrogram based on the viewport and recording settings. It then fetches
 * the spectrogram image and provides a function (`drawFn`) to draw the image
 * onto a canvas.
 */
export default function useRecordingSpectrogram({
  recording,
  audioSettings,
  spectrogramSettings,
  viewport,
  getImageUrl,
  timeout = 30_000,
  onLoad,
  onError,
  onTimeout,
}: {
  /** The recording object to display the spectrogram for. */
  recording: Recording;
  /** Audio settings for the spectrogram. */
  audioSettings: AudioSettings;
  /** Spectrogram settings (window size, hop size, etc.). */
  spectrogramSettings: SpectrogramSettings;
  /** The current viewport (time and frequency range) to display. */
  viewport: SpectrogramWindow;
  /** A function to get the URL for fetching the spectrogram image. */
  getImageUrl: (props: {
    recording: Recording;
    interval: Interval;
    audioSettings: AudioSettings;
    spectrogramSettings: SpectrogramSettings;
  }) => string;
  /** Optional timeout (in milliseconds) for image fetching. Defaults to 30
   * seconds. */
  timeout?: number;
  /** Optional callback function to be executed when the image is loaded
   * successfully. */
  onLoad?: () => void;
  /** Optional callback function to be executed if an error occurs during image
   * loading. */
  onError?: (e: Error) => void;
  /** Optional callback function to be executed if the image loading times out.
   * */
  onTimeout?: () => void;
}) {
  const [duration, center] = useMemo(() => {
    const duration = getWindowDuration(
      viewport,
      recording.samplerate,
      spectrogramSettings.window_size,
      spectrogramSettings.hop_size,
    );
    const center = getWindowCenter(viewport, duration);
    return [duration, center];
  }, [
    viewport,
    recording.samplerate,
    spectrogramSettings.window_size,
    spectrogramSettings.hop_size,
  ]);

  const interval = useMemo(() => {
    return { min: center - duration / 2, max: center + duration / 2 };
  }, [center, duration]);

  const url = useMemo(() => {
    return getImageUrl({
      recording,
      interval,
      audioSettings,
      spectrogramSettings,
    });
  }, [recording, interval, audioSettings, spectrogramSettings, getImageUrl]);

  const { image, isLoading, error } = useImage({
    url,
    timeout,
    onLoad,
    onError,
    onTimeout,
  });

  const drawFn = useCallback(
    (ctx: CanvasRenderingContext2D, viewport: SpectrogramWindow) => {
      const { current } = image;

      if (isLoading || error !== null || current == null) return;

      drawImage({
        ctx,
        image: current,
        window: viewport,
        bounds: {
          time: interval,
          freq: { min: 0, max: recording.samplerate / 2 },
        },
      });
    },
    [image, isLoading, error, recording, interval],
  );

  return {
    drawFn,
    interval,
    image,
    isLoading,
    isError: error !== null,
    error,
  };
}

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
 */ export function getWindowCenter(
  viewport: SpectrogramWindow,
  windowDuration: number,
  windowOverlap: number = WINDOW_OVERLAP,
): number {
  const viewportCenter = (viewport.time.min + viewport.time.max) / 2;

  const hopSize = (1 - windowOverlap) * windowDuration;

  const center =
    Math.round((viewportCenter - windowDuration / 2) / hopSize) * hopSize +
    windowDuration / 2;

  return center;
}
