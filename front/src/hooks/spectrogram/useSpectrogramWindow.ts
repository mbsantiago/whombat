import { useMemo, useCallback } from "react";
import drawImage from "@/draw/image";
import useImage from "@/hooks/spectrogram/useImage";
import api from "@/app/api";
import { type Interval } from "@/api/audio";
import { type SpectrogramWindow } from "@/api/spectrograms";
import {
  type SpectrogramParameters,
  DEFAULT_SPECTROGRAM_PARAMETERS,
} from "@/api/spectrograms";

type GetUrlFn = ({
  recording_id,
  segment,
  parameters,
}: {
  recording_id: number;
  segment: Interval;
  parameters: SpectrogramParameters;
}) => string;

/** Use the image of a spectrogram window.
 * This hook will load the image of a spectrogram corresponding to
 * the given window (time and freq bounds) and parameters.
 */
export default function useSpectrogramWindow({
  recording_id,
  window: spectrogramWindow,
  parameters = DEFAULT_SPECTROGRAM_PARAMETERS,
  getSpectrogramImageUrl = api.spectrograms.getUrl,
}: {
  recording_id: number;
  window: SpectrogramWindow;
  parameters?: SpectrogramParameters;
  getSpectrogramImageUrl?: GetUrlFn;
}) {
  // Get the url of the image to load
  const url = useMemo(() => {
    return getSpectrogramImageUrl({
      recording_id,
      segment: spectrogramWindow.time,
      parameters,
    });
  }, [
    recording_id,
    spectrogramWindow.time,
    parameters,
    getSpectrogramImageUrl,
  ]);

  // Start loading the image
  const { isLoading, isError, image } = useImage({ url });

  // Create a callback to draw the image on a canvas. The callback takes in a
  // canvas context and the current viewport (window). It will draw the image
  // on the canvas, adjusting the position and size relative to the viewport.
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, view: SpectrogramWindow) => {
      if (isLoading || isError) return null;
      return drawImage({
        ctx,
        image,
        window: view,
        bounds: spectrogramWindow,
      });
    },
    [image, isLoading, isError, spectrogramWindow],
  );

  return {
    image,
    window: spectrogramWindow,
    draw,
  };
}
