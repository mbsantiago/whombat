import { useEffect, useCallback, useRef } from "react";
import type {
  Recording,
  SpectrogramSettings,
  Interval,
  SpectrogramWindow,
  AudioSettings,
} from "@/types";

import drawImage from "@/draw/image";
import { intervalIntersection, scaleInterval } from "@/utils/geometry";
import useSegments, { type IntervalState } from "./useSegmentsState";

import api from "@/app/api";

/**
 * The size in pixels of a spectrogram chunk.
 */
const SPECTROGRAM_CHUNK_SIZE = 256 * 256;

/**
 * The overlap fraction between consecutive spectrogram chunks.
 */
const SPECTROGRAM_CHUNK_OVERLAP = 0.05;

/**
 * Calculates the time intervals for spectrogram chunks based on recording and
 * settings.
 */
function calculateSpectrogramChunkIntervals({
  recording,
  audioSettings,
  spectrogramSettings,
}: {
  /** The recording object. */
  recording: Recording;
  /** Audio settings for the spectrogram. */
  audioSettings: AudioSettings;
  /** Spectrogram settings. */
  spectrogramSettings: SpectrogramSettings;
}): Interval[] {
  const { window_size, hop_size } = spectrogramSettings;

  const samplerate = !audioSettings.resample
    ? recording.samplerate
    : audioSettings.samplerate ?? recording.samplerate;

  const approxSpecHeight = (window_size * samplerate) / 2;
  const approxSpecWidth = SPECTROGRAM_CHUNK_SIZE / approxSpecHeight;

  const chunkDuration = approxSpecWidth * (1 - hop_size) * window_size;
  const chunkHop = chunkDuration * (1 - SPECTROGRAM_CHUNK_OVERLAP);

  return Array.from(
    { length: Math.ceil(recording.duration / chunkDuration) },
    (_, i) => {
      return { min: i * chunkHop, max: i * chunkHop + chunkDuration };
    },
  );
}

export type RecordingSpectrogramInterface = {
  /** A function to draw the spectrogram on a canvas. */
  drawFn: (ctx: CanvasRenderingContext2D, viewport: SpectrogramWindow) => void;
  /** The state of the spectrogram segments. */
  segments: IntervalState[];
};

/**
 * A custom React hook for managing the display of a recording's spectrogram.
 */
export default function useRecordingSpectrogram({
  recording,
  audioSettings,
  spectrogramSettings,
  getImageUrl = api.spectrograms.getUrl,
  onLoad,
  onError,
}: {
  /** The recording object to display the spectrogram for. */
  recording: Recording;
  /** Audio settings for the spectrogram. */
  audioSettings: AudioSettings;
  /** Spectrogram settings (window size, hop size, etc.). */
  spectrogramSettings: SpectrogramSettings;
  /** A function to get the URL for fetching the spectrogram image. */
  getImageUrl?: (props: {
    recording: Recording;
    interval: Interval;
    audioSettings: AudioSettings;
    spectrogramSettings: SpectrogramSettings;
  }) => string;
  /** Optional callback function to be executed when an image is loaded
   * successfully. */
  onLoad?: (args: {
    image: HTMLImageElement;
    url: string;
    interval: Interval;
    index: number;
  }) => void;
  /** Optional callback function to be executed if an error occurs during image
   * loading. */
  onError?: (args: {
    error: Error;
    image: HTMLImageElement;
    interval: Interval;
    index: number;
  }) => void;
}): RecordingSpectrogramInterface {
  const { segments, setSegments, setReady, setError } = useSegments();
  const images = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    const chunks = calculateSpectrogramChunkIntervals({
      recording,
      audioSettings,
      spectrogramSettings,
    });

    setSegments(chunks);

    images.current = chunks.map((interval, index) => {
      const image = new Image();
      image.loading = "lazy";
      image.src = getImageUrl({
        recording,
        interval,
        audioSettings,
        spectrogramSettings,
      });
      image.onload = () => {
        setReady(index);
        onLoad?.({ image, url: image.src, interval, index });
      };
      image.onerror = () => {
        setError(index);
        onError?.({
          error: new Error("Failed to load image"),
          image,
          interval,
          index,
        });
      };
      return image;
    });
  }, [
    recording,
    audioSettings,
    spectrogramSettings,
    getImageUrl,
    setSegments,
    setReady,
    setError,
    onLoad,
    onError,
  ]);

  const drawFn = useCallback(
    (ctx: CanvasRenderingContext2D, viewport: SpectrogramWindow) => {
      const { current } = images;

      segments.forEach((state) => {
        const { interval, index, isLoading, isError, isReady } = state;

        if (isError || isLoading) return;

        const image = current[index];

        if (!image) return;

        if (
          !isReady &&
          intervalIntersection(scaleInterval(interval, 3), viewport.time) !=
            null
        ) {
          image.loading = "eager";
          return;
        }

        if (intervalIntersection(interval, viewport.time) == null) return;

        drawImage({
          ctx,
          image,
          window: viewport,
          bounds: {
            time: interval,
            freq: { min: 0, max: recording.samplerate / 2 },
          },
        });
      });
    },
    [segments, recording.samplerate],
  );

  return {
    drawFn,
    segments,
  };
}
