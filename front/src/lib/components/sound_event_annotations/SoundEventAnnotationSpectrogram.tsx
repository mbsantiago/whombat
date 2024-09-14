import { useRef, useMemo, useCallback } from "react";
import { DEFAULT_SPECTROGRAM_PARAMETERS } from "@/lib/api/spectrograms";
import Player from "@/lib/components/audio/Player";
import Card from "@/lib/components/ui/Card";
import SpectrogramBar from "@/lib/components/spectrograms/ViewportBar";
import ViewportToolbar from "@/lib/components/spectrograms/ViewportToolbar";
import SpectrogramSettings from "@/lib/components/settings/SpectrogramSettings";
import SpectrogramTags from "@/lib/components/spectrograms/SpectrogramTags";
import type {
  SoundEventAnnotation,
  SpectrogramParameters,
  Position,
  Recording,
} from "@/lib/types";
import useSpectrogram from "@/lib/hooks/spectrogram/useSpectrogram";
import useAudio from "@/lib/hooks/audio/useAudio";
import useCanvas from "@/lib/hooks/draw/useCanvas";
import useSpectrogramTrackAudio from "@/lib/hooks/spectrogram/useSpectrogramTrackAudio";
import { computeGeometryBBox } from "@/lib/utils/geometry";
import { getCenteredViewingWindow } from "@/lib/utils/windows";
import useAnnotationDraw from "@/lib/hooks/annotation/useAnnotationDraw";
import useSpectrogramTags from "@/lib/hooks/spectrogram/useSpectrogramTags";

const MIN_DURATION = 0.2;
const MAX_DURATION = 5;

export default function SoundEventAnnotationSpectrogram(props: {
  recording: Recording;
  soundEventAnnotation: SoundEventAnnotation;
  parameters?: SpectrogramParameters;
  height?: number;
  withBar?: boolean;
  withPlayer?: boolean;
  withControls?: boolean;
  withSettings?: boolean;
  onParametersSave?: (parameters: SpectrogramParameters) => void;
}) {
  const {
    recording,
    soundEventAnnotation,
    parameters = DEFAULT_SPECTROGRAM_PARAMETERS,
    height = 384, // Equivalent to h-96 in Tailwind CSS
    withBar = true,
    withPlayer = true,
    withControls = true,
    withSettings = true,
    onParametersSave,
  } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dimensions = canvasRef.current?.getBoundingClientRect() ?? {
    width: 0,
    height: 0,
  };

  const [startTime, endTime] = useMemo(() => {
    const [startTime, _, endTime] = computeGeometryBBox(
      soundEventAnnotation.sound_event.geometry,
    );
    return [startTime, endTime];
  }, [soundEventAnnotation.sound_event]);

  const bounds = useMemo(() => {
    const duration = Math.max((endTime - startTime) * 9, MIN_DURATION);
    const center = (startTime + endTime) / 2;

    return {
      time: { min: center - duration / 2, max: center + duration / 2 },
      freq: { min: 0, max: recording.samplerate / 2 },
    };
  }, [recording.samplerate, startTime, endTime]);

  const initial = useMemo(() => {
    const duration = Math.min((endTime - startTime) * 5, MAX_DURATION);
    const center = (startTime + endTime) / 2;

    return getCenteredViewingWindow({
      startTime: center - duration / 2,
      endTime: center + duration / 2,
      samplerate: recording.samplerate,
      parameters,
    });
  }, [recording.samplerate, parameters, startTime, endTime]);

  const audio = useAudio({
    recording,
    endTime: bounds.time.max,
    startTime: bounds.time.min,
  });

  const { seek } = audio;
  const handleDoubleClick = useCallback(
    ({ position }: { position: Position }) => {
      seek(position.time);
    },
    [seek],
  );

  const spectrogram = useSpectrogram({
    dimensions,
    recording,
    bounds,
    initial,
    parameters,
    onDoubleClick: handleDoubleClick,
    enabled: !audio.isPlaying,
  });

  const { centerOn } = spectrogram;

  const handleTimeChange = useCallback(
    (time: number) => centerOn({ time }),
    [centerOn],
  );

  const { draw: drawTrackAudio, enabled: trackingAudio } =
    useSpectrogramTrackAudio({
      viewport: spectrogram.viewport,
      currentTime: audio.currentTime,
      isPlaying: audio.isPlaying,
      onTimeChange: handleTimeChange,
    });

  const {
    props: spectrogramProps,
    draw: drawSpectrogram,
    isLoading: spectrogramIsLoading,
  } = spectrogram;

  const drawAnnotation = useAnnotationDraw({
    viewport: spectrogram.viewport,
    annotations: [soundEventAnnotation],
  });

  const tags = useSpectrogramTags({
    annotations: [soundEventAnnotation],
    viewport: spectrogram.viewport,
    dimensions,
    disabled: true,
  });

  const draw = useMemo(() => {
    if (spectrogramIsLoading) {
      return (ctx: CanvasRenderingContext2D) => {
        ctx.canvas.style.cursor = "wait";
      };
    }
    if (trackingAudio) {
      return (ctx: CanvasRenderingContext2D) => {
        drawSpectrogram(ctx);
        drawTrackAudio(ctx);
        drawAnnotation(ctx);
      };
    }
    return (ctx: CanvasRenderingContext2D) => {
      drawSpectrogram(ctx);
      drawAnnotation(ctx);
    };
  }, [
    drawSpectrogram,
    drawTrackAudio,
    spectrogramIsLoading,
    trackingAudio,
    drawAnnotation,
  ]);

  useCanvas({ ref: canvasRef, draw });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-4">
        {withControls && (
          <ViewportToolbar
            dragEnabled={spectrogram.canDrag}
            zoomEnabled={spectrogram.canZoom}
            onResetClick={spectrogram.reset}
            onDragClick={spectrogram.enableDrag}
            onZoomClick={spectrogram.enableZoom}
          />
        )}
        {withSettings && (
          <SpectrogramSettings
            samplerate={recording.samplerate}
            settings={spectrogram.parameters}
            onChange={spectrogram.setParameters}
            onReset={spectrogram.resetParameters}
            onSave={() => onParametersSave?.(spectrogram.parameters)}
          />
        )}
        {withPlayer && <Player {...audio} />}
      </div>
      <div className="relative rounded-md" style={{ height: height }}>
        <SpectrogramTags tags={tags} disabled>
          <canvas
            ref={canvasRef}
            {...spectrogramProps}
            className="absolute w-full h-full"
          />
        </SpectrogramTags>
      </div>
      {withBar && (
        <SpectrogramBar
          bounds={spectrogram.bounds}
          viewport={spectrogram.viewport}
          onMove={spectrogram.zoom}
        />
      )}
    </div>
  );
}
