import { useCallback, useMemo } from "react";

import useImage, { type ImageStatus } from "@/hooks/useImage";
import useWindowSegments from "@/hooks/useWindowSegments";
import drawImage from "@/draw/image";
import { type Interval } from "@/api/audio";
import {
  type SpectrogramWindow,
  type SpectrogramParameters,
  DEFAULT_SPECTROGRAM_PARAMETERS,
} from "@/api/spectrograms";
import api from "@/app/api";

interface SpectrogramImage {
  image: ImageStatus;
  draw: (ctx: CanvasRenderingContext2D) => void;
  segment: Interval;
}

export default function useSpectrogramImage(
  recording_id: number,
  window: SpectrogramWindow,
  bounds: SpectrogramWindow,
  {
    getSpectrogramImageUrl = api.spectrograms.getUrl,
    parameters = DEFAULT_SPECTROGRAM_PARAMETERS,
    // neighbors = 1,
  }: {
    parameters?: SpectrogramParameters;
    // neighbors?: number;
    getSpectrogramImageUrl?: ({
      recording_id,
      segment,
      parameters,
    }: {
      recording_id: number;
      segment: Interval;
      parameters: SpectrogramParameters;
    }) => string;
  } = {},
): SpectrogramImage {
  const { segments, selected } = useWindowSegments({ window, bounds });

  const url = useMemo(() => {
    const selectedSegment = segments[selected] ?? { min: 0, max: 0 };
    return getSpectrogramImageUrl({
      recording_id,
      segment: selectedSegment,
      parameters,
    });
  }, [recording_id, segments, selected, parameters, getSpectrogramImageUrl]);

  const image = useImage(url);

  // Preload neighboring images
  // const neighboringImages = useMemo(() => {
  //   const ret: HTMLImageElement[] = [];
  //   for (let i = 0; i < segments.length; i += 1) {
  //     if (Math.abs(i - selected) <= neighbors && i !== selected) {
  //       const otherUrl = getSpectrogramImageUrl(recording_id, segments[i]);
  //       const neighboringImage = new Image();
  //       neighboringImage.src = otherUrl;
  //       ret.push(neighboringImage);
  //     }
  //   }
  //   return ret;
  // }, [segments, selected, neighbors, recording_id, getSpectrogramImageUrl]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      drawImage({
        ctx,
        image,
        window,
        bounds: {
          time: segments[selected] ?? { min: 0, max: 0 },
          freq: bounds.freq,
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      image.isLoading,
      image.isError,
      image.url,
      window.time.min,
      window.time.max,
      window.freq.min,
      window.freq.max,
      bounds.time.min,
      bounds.time.max,
      bounds.freq.min,
      bounds.freq.max,
      selected,
    ],
  );

  return {
    image,
    segment: segments[selected] ?? { min: 0, max: 0 },
    draw,
  };
}
