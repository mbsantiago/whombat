import { useRef, useCallback } from "react";
import useCanvas from "@/hooks/useCanvas";
import useSpectrogramWindow from "@/hooks/useSpectrogramWindow";
import useRecordingSegments from "@/hooks/useRecordingSegments";
import drawTimeAxis from "@/draw/timeAxis";
import drawFreqAxis from "@/draw/freqAxis";
import drawOnset from "@/draw/onset";
import { type Recording } from "@/api/recordings";
import {
  type SpectrogramWindow,
  type SpectrogramParameters,
} from "@/api/spectrograms";

export default function useSpectrogramCanvas({
  recording,
  window,
  parameters,
  currentTime,
  onDraw,
}: {
  recording: Recording;
  window: SpectrogramWindow;
  parameters: SpectrogramParameters;
  currentTime?: number;
  onDraw?: (ctx: CanvasRenderingContext2D, window: SpectrogramWindow) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

      if (currentTime) {
        if (currentTime < window.time.min || currentTime > window.time.max) {
          return;
        }

        const { min, max } = window.time;
        const x = Math.ceil(
          (ctx.canvas.width * (currentTime - min)) / (max - min),
        );
        drawOnset(ctx, x);
      }

      onDraw?.(ctx, window);
    },
    [drawSpecWindow, onDraw, window],
  );

  useCanvas({ ref: canvasRef, draw });
  const element = <canvas ref={canvasRef} />;

  return {
    canvas: element,
    canvasRef,
  };
}
