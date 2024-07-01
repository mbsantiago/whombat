import { useCallback } from "react";

import useViewport from "@/hooks/window/useViewport";
import useSpectrogramAudio from "@/hooks/spectrogram/useSpectrogramAudio";
import useSpectrogramImages from "@/hooks/spectrogram/useSpectrogramImages";
import useSpectrogramState from "@/hooks/spectrogram/useSpectrogramState";
import useSpectrogramBarInteractions from "@/hooks/spectrogram/useSpectrogramBarInteractions";
import useSpectrogramParameters from "@/hooks/spectrogram/useSpectrogramParameters";
import useSpectrogramInteractions from "@/hooks/spectrogram/useSpectrogramInteractions";

import drawOnset from "@/draw/onset";
import { scaleTimeToViewport } from "@/utils/geometry";
import { getInitialViewingWindow } from "@/utils/windows";

import type {
  Recording,
  AudioSettings,
  SpectrogramSettings,
  SpectrogramWindow,
} from "@/types";

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
  const parameters = useSpectrogramParameters({
    audioSettings,
    spectrogramSettings,
  });

  const state = useSpectrogramState();

  const viewport = useViewport({
    initial: getInitialViewingWindow({
      startTime: bounds.time.min,
      endTime: bounds.time.max,
      samplerate: recording.samplerate,
      parameters,
    }),
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
