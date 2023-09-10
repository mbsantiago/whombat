import { useRef, type HTMLProps } from "react";
import useCanvas from "@/hooks/useCanvas";
import useSpectrogramImage from "@/hooks/useSpectrogram";
import {
  type SpectrogramWindow,
  type SpectrogramParameters,
} from "@/api/spectrograms";

export interface SpectrogramImageProps {
  recording: number;
  bounds: SpectrogramWindow;
  window: SpectrogramWindow;
  width?: number;
  height?: number;
  parameters?: SpectrogramParameters;
}

export default function SpectrogramImage({
  recording,
  window,
  bounds,
  parameters,
  ...props
}: SpectrogramImageProps & HTMLProps<HTMLCanvasElement>) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { draw } = useSpectrogramImage(recording, window, bounds, {
    parameters,
  });
  useCanvas({ ref, draw });
  return <canvas ref={ref} {...props} />;
}
