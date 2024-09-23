import { useCallback, useMemo } from "react";
import { mergeProps } from "react-aria";

import SoundEventSpectrogramTags from "@/app/components/sound_event_annotations/SoundEventSpectrogramTags";

import CanvasBase from "@/lib/components/spectrograms/Canvas";
import SpectrogramTags from "@/lib/components/spectrograms/SpectrogramTags";

import useSoundEventDraw from "@/lib/hooks/annotation/useAnnotationDraw";
import useSpectrogramImages from "@/lib/hooks/spectrogram/useSpectrogramImages";
import useSpectrogramInteractions from "@/lib/hooks/spectrogram/useSpectrogramInteractions";

import drawOnset from "@/lib/draw/onset";
import type {
  AudioController,
  AudioSettings,
  CanvasProps,
  Recording,
  SoundEventAnnotation,
  SpectrogramSettings,
  SpectrogramState,
  SpectrogramWindow,
  ViewportController,
} from "@/lib/types";
import { scaleTimeToViewport } from "@/lib/utils/geometry";

export default function ClipAnnotationCanvas({
  soundEventAnnotation,
  viewport,
  recording,
  audioSettings,
  spectrogramSettings,
  audio,
  spectrogramState,
  height = 400,
  withAnnotations = true,
  enabled = true,
}: {
  soundEventAnnotation: SoundEventAnnotation;
  audio: AudioController;
  recording: Recording;
  spectrogramState: SpectrogramState;
  viewport: ViewportController;
  audioSettings: AudioSettings;
  spectrogramSettings: SpectrogramSettings;
  height?: number;
  withAnnotations?: boolean;
  enabled?: boolean;
}) {
  const { drawFn: drawInteractions, ...interactionProps } =
    useSpectrogramInteractions({
      viewport,
      audio,
      state: spectrogramState.mode,
      onZoom: spectrogramState.enablePanning,
    });

  const { drawFn: drawSpectrogram } = useSpectrogramImages({
    recording,
    audioSettings,
    spectrogramSettings,
  });

  const soundEvents = useMemo(() => {
    if (!withAnnotations) return [];
    return [soundEventAnnotation];
  }, [withAnnotations, soundEventAnnotation]);

  const drawAnnotations = useSoundEventDraw({
    viewport: viewport.viewport,
    soundEvents,
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
      drawAnnotations(ctx);
    },
    [audio.currentTime, drawSpectrogram, drawInteractions, drawAnnotations],
  );

  let canvasProps: CanvasProps = mergeProps(interactionProps);

  return (
    <SpectrogramTags
      soundEvents={soundEvents}
      viewport={viewport.viewport}
      SoundEventTags={SoundEventSpectrogramTags}
      enabled={enabled}
    >
      <CanvasBase
        viewport={viewport.viewport}
        height={height}
        drawFn={drawFn}
        {...canvasProps}
      />
    </SpectrogramTags>
  );
}
