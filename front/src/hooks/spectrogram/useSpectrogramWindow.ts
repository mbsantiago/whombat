import { useCallback, useMemo } from "react";

import { type Interval } from "@/api/audio";
import { type Recording } from "@/api/schemas";
import {
  DEFAULT_SPECTROGRAM_PARAMETERS,
  type SpectrogramParameters,
  type SpectrogramWindow,
} from "@/api/spectrograms";
import api from "@/app/api";
import drawImage from "@/draw/image";
import useImage from "@/hooks/spectrogram/useImage";

type GetUrlFn = ({
  recording,
  segment,
  parameters,
}: {
  recording: Recording;
  segment: Interval;
  parameters: SpectrogramParameters;
}) => string;

/** Use the image of a spectrogram window.
 * This hook will load the image of a spectrogram corresponding to
 * the given window (time and freq bounds) and parameters.
 */
export default function useSpectrogramWindow({
  recording,
  window: spectrogramWindow,
  parameters = DEFAULT_SPECTROGRAM_PARAMETERS,
  getSpectrogramImageUrl = api.spectrograms.getUrl,
}: {
  recording: Recording;
  window: SpectrogramWindow;
  parameters?: SpectrogramParameters;
  getSpectrogramImageUrl?: GetUrlFn;
}) {
  // Get the url of the image to load
  const url = useMemo(() => {
    return getSpectrogramImageUrl({
      recording,
      segment: spectrogramWindow.time,
      parameters,
    });
  }, [recording, spectrogramWindow.time, parameters, getSpectrogramImageUrl]);

  // Start loading the image
  const { isLoading, isError, image } = useImage({ url });

  // Create a callback to draw the image on a canvas. The callback takes in a
  // canvas context and the current viewport (window). It will draw the image
  // on the canvas, adjusting the position and size relative to the viewport.
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, view: SpectrogramWindow) => {
      if (isLoading || isError) return;

      drawImage({
        ctx,
        image,
        window: view,
        bounds: spectrogramWindow,
      });
    },
    [image, spectrogramWindow, isLoading, isError],
  );

  return {
    image,
    viewport: spectrogramWindow,
    isLoading,
    isError,
    draw,
  } as const;
}
