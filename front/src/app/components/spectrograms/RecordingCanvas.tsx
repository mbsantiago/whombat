import { useCallback, useState } from "react";

import CanvasBase from "@/lib/components/spectrograms/Canvas";

import useSpectrogramImages from "@/lib/hooks/spectrogram/useSpectrogramImages";
import useSpectrogramInteractions from "@/lib/hooks/spectrogram/useSpectrogramInteractions";

import { drawCursor } from "@/lib/draw/cursor";
import drawOnset from "@/lib/draw/onset";
import type {
  AudioController,
  AudioSettings,
  Position,
  Recording,
  SpectrogramSettings,
  SpectrogramState,
  SpectrogramWindow,
  ViewportController,
} from "@/lib/types";
import { scaleTimeToViewport } from "@/lib/utils/geometry";

export default function RecordingCanvas({
  viewport,
  recording,
  audioSettings,
  spectrogramSettings,
  audio,
  state,
  height = 600,
}: {
  audio: AudioController;
  recording: Recording;
  state: SpectrogramState;
  viewport: ViewportController;
  audioSettings: AudioSettings;
  spectrogramSettings: SpectrogramSettings;
  height?: number;
}) {
  const [cursorPosition, setCursorPosition] = useState<Position>({
    time: 0,
    freq: 0,
  });

  const { drawFn: drawSpectrogram } = useSpectrogramImages({
    recording,
    audioSettings,
    spectrogramSettings,
  });

  const { drawFn: drawInteractions, ...props } = useSpectrogramInteractions({
    viewport,
    audio,
    state: state.mode,
    onZoom: state.enablePanning,
  });

  const drawFn = useCallback(
    (ctx: CanvasRenderingContext2D, viewport: SpectrogramWindow) => {
      drawSpectrogram(ctx, viewport);

      const time = scaleTimeToViewport(
        audio.currentTime,
        viewport,
        ctx.canvas.width,
      );

      drawOnset(ctx, time);
      drawInteractions(ctx, viewport);
      drawCursor(ctx, cursorPosition, viewport);
    },
    [audio.currentTime, drawSpectrogram, drawInteractions, cursorPosition],
  );

  return (
    <CanvasBase
      viewport={viewport.viewport}
      height={height}
      drawFn={drawFn}
      onHover={({ position }) => setCursorPosition(position)}
      {...props}
    />
  );
}
