import { type HTMLProps, useCallback, useRef } from "react";

import useCanvas from "@/hooks/draw/useCanvas";
import useSpectrogramWindow from "@/hooks/spectrogram/useSpectrogramWindow";
import useRecordingSegments from "@/hooks/spectrogram/useRecordingSegments";
import drawTimeAxis from "@/draw/timeAxis";
import drawFreqAxis from "@/draw/freqAxis";
import { type Recording } from "@/api/recordings";
import {
  type SpectrogramParameters,
  type SpectrogramWindow,
} from "@/api/spectrograms";

export type SpectrogramCanvas = {
  recording: Recording;
  window: SpectrogramWindow;
  parameters?: SpectrogramParameters;
} & HTMLProps<HTMLCanvasElement>;

export default function SpectrogramCanvas({
  recording,
  window,
  parameters,
  ...props
}: SpectrogramCanvas) {
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
