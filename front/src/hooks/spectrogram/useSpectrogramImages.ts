import { useEffect, useCallback, useRef } from "react";
import type {
  Recording,
  SpectrogramSettings,
  Interval,
  SpectrogramWindow,
  SpectrogramParameters,
  AudioSettings,
} from "@/types";

import drawImage from "@/draw/image";
import {
  calculateSpectrogramChunkIntervals,
  SPECTROGRAM_CHUNK_BUFFER,
  SPECTROGRAM_CHUNK_SIZE,
} from "@/utils/spectrogram_segments";
import useSpectrogramParameters from "./useSpectrogramParameters";
import drawTimeAxis from "@/draw/timeAxis";
import drawFreqAxis from "@/draw/freqAxis";
import useSegments, { type IntervalState } from "./useSegmentsState";
import { intervalIntersection, scaleInterval } from "@/utils/geometry";

import api from "@/app/api";

export type RecordingSpectrogramInterface = {
  /** A function to draw the spectrogram on a canvas. */
  drawFn: (ctx: CanvasRenderingContext2D, viewport: SpectrogramWindow) => void;
  /** The state of the spectrogram segments. */
  segments: IntervalState[];
};

/**
 * A custom React hook for managing the display of a recording's spectrogram.
 */
export default function useSpectrogramImages({
  recording,
  audioSettings,
  spectrogramSettings,
  onLoad,
  onError,
  getImageUrl = api.spectrograms.getUrl,
  chunkSize = SPECTROGRAM_CHUNK_SIZE,
  chunkBuffer = SPECTROGRAM_CHUNK_BUFFER,
}: {
  /** The recording object to display the spectrogram for. */
  recording: Recording;
  /** Audio settings for the spectrogram. */
  audioSettings: AudioSettings;
  /** Spectrogram settings (window size, hop size, etc.). */
  spectrogramSettings: SpectrogramSettings;
  /** A function to get the URL for fetching the spectrogram image. */
  getImageUrl?: (
    props: {
      recording: Recording;
      interval: Interval;
    } & SpectrogramParameters,
  ) => string;
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
  /** The size of each spectrogram chunk in pixels. */
  chunkSize?: number;
  /** The overlap fraction between consecutive chunks. */
  chunkBuffer?: number;
}): RecordingSpectrogramInterface {
  const { segments, setSegments, setReady, setError, startLoading } =
    useSegments();
  const images = useRef<HTMLImageElement[]>([]);

  const params = useSpectrogramParameters({
    audioSettings,
    spectrogramSettings,
  });

  useEffect(() => {
    const finalSamplerate = !params.resample
      ? recording.samplerate
      : params.samplerate ?? recording.samplerate;

    const chunks = calculateSpectrogramChunkIntervals({
      duration: recording.duration,
      windowSize: params.window_size,
      overlap: params.hop_size,
      samplerate: finalSamplerate,
      chunkSize,
      chunkBuffer,
    });

    setSegments(chunks);

    images.current = chunks.map((interval, index) => {
      const image = new Image();
      image.loading = "lazy";
      image.src = getImageUrl({
        recording,
        interval,
        ...params,
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
    params,
    getImageUrl,
    setSegments,
    setReady,
    setError,
    onLoad,
    onError,
    chunkSize,
    chunkBuffer,
  ]);

  const drawFn = useCallback(
    (ctx: CanvasRenderingContext2D, viewport: SpectrogramWindow) => {
      const { current } = images;

      const shouldLoad = segments.filter(
        ({ interval, isReady, isLoading, isError }) => {
          if (isReady || isLoading || isError) return false;
          // Should start loading if the interval is close to the viewport
          return (
            intervalIntersection(interval, scaleInterval(viewport.time, 4)) !=
            null
          );
        },
      );

      if (shouldLoad.length > 0) {
        const indices = shouldLoad.map(({ index }) => index);
        startLoading(indices);
        shouldLoad.forEach(({ index }) => {
          const image = current[index];
          if (!image) return;
          image.loading = "eager";
        });
      }

      segments.forEach((state) => {
        const { interval, index, isLoading, isError } = state;
        const image = current[index];

        if (!image || intervalIntersection(interval, viewport.time) == null)
          return;

        drawImage({
          ctx,
          image,
          viewport: viewport,
          imageBounds: {
            time: interval,
            freq: { min: 0, max: recording.samplerate / 2 },
          },
          overlap: chunkBuffer,
          loading: isLoading,
          error: isError,
        });
      });

      drawTimeAxis(ctx, viewport.time);
      drawFreqAxis(ctx, viewport.freq);
    },
    [segments, recording.samplerate, chunkBuffer, startLoading],
  );

  return {
    drawFn,
    segments,
  };
}
