import type { Chunk } from "@/types";

/**
 * The size in pixels of a spectrogram chunk.
 */
export const SPECTROGRAM_CHUNK_SIZE = 512 * 512;

/**
 * The buffer in number of spectrogram windows to add to each chunk.
 */
export const SPECTROGRAM_CHUNK_BUFFER = 10;

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
}): Chunk[] {
  const approxSpecHeight = (windowSize * samplerate) / 2;
  const approxSpecWidth = chunkSize / approxSpecHeight;
  const windowWidth = (1 - overlap) * windowSize;
  const chunkDuration = approxSpecWidth * (1 - overlap) * windowSize;
  const buffer = (chunkBuffer - 1) * windowWidth + windowSize;
  return Array.from({ length: Math.ceil(duration / chunkDuration) }, (_, i) => {
    return {
      interval: {
        min: i * chunkDuration,
        max: (i + 1) * chunkDuration,
      },
      buffer: {
        min: i * chunkDuration - buffer,
        max: (i + 1) * chunkDuration + buffer,
      },
    };
  });
}
