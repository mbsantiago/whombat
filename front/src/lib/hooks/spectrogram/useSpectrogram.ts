import { useCallback } from "react";

import useViewport from "@/lib/hooks/window/useViewport";
import useSpectrogramAudio from "@/lib/hooks/spectrogram/useSpectrogramAudio";
import useSpectrogramImages from "@/lib/hooks/spectrogram/useSpectrogramImages";
import useSpectrogramState from "@/lib/hooks/spectrogram/useSpectrogramState";
import useSpectrogramBarInteractions from "@/lib/hooks/spectrogram/useSpectrogramBarInteractions";
import useSpectrogramInteractions from "@/lib/hooks/spectrogram/useSpectrogramInteractions";

import drawOnset from "@/lib/draw/onset";
import { scaleTimeToViewport } from "@/lib/utils/geometry";
import { getInitialViewingWindow } from "@/lib/utils/windows";

import type {
  Recording,
  AudioSettings,
  SpectrogramSettings,
  SpectrogramWindow,
} from "@/lib/types";

export default function useSpectrogram({
  recording,
  bounds,
  audioSettings,
  spectrogramSettings,
}: {
  recording: Recording;
  bounds: SpectrogramWindow;
  audioSettings: AudioSettings;
  spectrogramSettings: SpectrogramSettings;
}) {
  const state = useSpectrogramState();

  const initial = getInitialViewingWindow({
    startTime: bounds.time.min,
    endTime: bounds.time.max,
    samplerate: recording.samplerate,
    windowSize: spectrogramSettings.window_size,
    overlap: spectrogramSettings.overlap,
  });

  const viewport = useViewport({
    initial,
    bounds,
  });

  const audio = useSpectrogramAudio({
    recording,
    bounds,
    viewport,
    audioSettings,
  });

  const { drawFn: drawSpectrogram } = useSpectrogramImages({
    recording,
    audioSettings,
    spectrogramSettings,
  });

  const {
    onMove,
    onMoveStart,
    onMoveEnd,
    onScroll,
    onDoubleClick,
    drawFn: drawInteractions,
  } = useSpectrogramInteractions({
    viewport,
    audio,
    state: state.state,
    onZoom: state.enablePanning,
  });

  const spectrogramBarProps = useSpectrogramBarInteractions({ viewport });

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
    },
    [audio.currentTime, drawSpectrogram, drawInteractions],
  );

  return {
    viewport,
    state,
    audio,
    barProps: spectrogramBarProps,
    canvasProps: {
      drawFn,
      onMove,
      onMoveStart,
      onMoveEnd,
      onScroll,
      onDoubleClick,
    },
  };
}
