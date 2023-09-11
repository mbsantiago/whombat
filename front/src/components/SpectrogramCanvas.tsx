import { useRef, useCallback, type HTMLProps } from "react";
import useCanvas from "@/hooks/useCanvas";
import useSpectrogramWindow from "@/hooks/useSpectrogramWindow";
import useRecordingSegments from "@/hooks/useRecordingSegments";
import drawTimeAxis from "@/draw/timeAxis";
import drawFreqAxis from "@/draw/freqAxis";
import { type Recording } from "@/api/recordings";
import {
  type SpectrogramWindow,
  type SpectrogramParameters,
} from "@/api/spectrograms";

export type SpectrogramImageProps = {
  recording: Recording;
  window: SpectrogramWindow;
  width?: number;
  height?: number;
  parameters?: SpectrogramParameters;
} & HTMLProps<HTMLCanvasElement>;

export default function SpectrogramImage({
  recording,
  window,
  parameters,
  ...props
}: SpectrogramImageProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  // Get a spectrogram segment that covers the window
  const { selected, prev, next } = useRecordingSegments({
    recording,
    window,
  });

  // Load the spectrogram segment
  const { draw: drawSpecWindow } = useSpectrogramWindow({
    recording_id: recording.id,
    window: selected,
    parameters,
  });

  // Load the previous and next spectrogram segments in the background
  useSpectrogramWindow({
    recording_id: recording.id,
    window: prev,
    parameters,
  });
  useSpectrogramWindow({
    recording_id: recording.id,
    window: next,
    parameters,
  });

  // Draw the spectrogram segment to the canvas with the current viewport
  // (window)
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      drawSpecWindow(ctx, window);
      drawTimeAxis(ctx, window.time);
      drawFreqAxis(ctx, window.freq);
    },
    [drawSpecWindow, window],
  );

  useCanvas({ ref, draw });
  return <canvas ref={ref} {...props} />;
}
