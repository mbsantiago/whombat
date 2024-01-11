import { useCallback, useMemo, useRef } from "react";

import { DEFAULT_SPECTROGRAM_PARAMETERS } from "@/api/spectrograms";
import Player from "@/components/audio/Player";
import Card from "@/components/Card";
import SpectrogramBar from "@/components/spectrograms/SpectrogramBar";
import SpectrogramControls from "@/components/spectrograms/SpectrogramControls";
import SpectrogramSettings from "@/components/spectrograms/SpectrogramSettings";
import useAudio from "@/hooks/audio/useAudio";
import useCanvas from "@/hooks/draw/useCanvas";
import useSpectrogram from "@/hooks/spectrogram/useSpectrogram";
import useSpectrogramTrackAudio from "@/hooks/spectrogram/useSpectrogramTrackAudio";

import type { Recording, SpectrogramParameters } from "@/types";

export default function RecordingSpectrogram({
  recording,
  height = 384,
  withBar = true,
  withControls = true,
  withSettings = true,
  withPlayer = true,
  parameters = DEFAULT_SPECTROGRAM_PARAMETERS,
  onParameterSave,
}: {
  recording: Recording;
  height?: number;
  withBar?: boolean;
  withControls?: boolean;
  withSettings?: boolean;
  withPlayer?: boolean;
  parameters?: SpectrogramParameters;
  onParameterSave?: (params: SpectrogramParameters) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dimensions = canvasRef.current?.getBoundingClientRect() ?? {
    width: 0,
    height: 0,
  };

  // These are the absolute bounds of the spectrogram
  const bounds = useMemo(
    () => ({
      time: { min: 0, max: recording.duration },
      freq: { min: 0, max: recording.samplerate / 2 },
    }),
    [recording.duration, recording.samplerate],
  );

  // This is the initial viewport of the spectrogram
  const initial = useMemo(
    () => ({
      time: { min: 0, max: Math.min(5, recording.duration) },
      freq: { min: 0, max: recording.samplerate / 2 },
    }),
    [recording.samplerate, recording.duration],
  );

  const audio = useAudio({
    recording,
    endTime: bounds.time.max,
    startTime: bounds.time.min,
  });

  const spectrogram = useSpectrogram({
    dimensions,
    recording,
    bounds,
    initial,
    parameters,
    enabled: !audio.isPlaying,
  });

  const { centerOn } = spectrogram;
  const handleTimeChange = useCallback(
    (time: number) => centerOn({ time }),
    [centerOn],
  );

  const { draw: drawTrackAudio } = useSpectrogramTrackAudio({
    viewport: spectrogram.viewport,
    currentTime: audio.currentTime,
    isPlaying: audio.isPlaying,
    onTimeChange: handleTimeChange,
  });

  const {
    props,
    draw: drawSpectrogram,
    isLoading: spectrogramIsLoading,
  } = spectrogram;

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.canvas.style.cursor = "wait";
      if (spectrogramIsLoading) return;
      drawSpectrogram(ctx);
      drawTrackAudio(ctx);
    },
    [drawSpectrogram, drawTrackAudio, spectrogramIsLoading],
  );

  useCanvas({ ref: canvasRef, draw });

  return (
    <Card>
      <div className="flex flex-row gap-4">
        {withControls && (
          <SpectrogramControls
            canDrag={spectrogram.canDrag}
            canZoom={spectrogram.canZoom}
            onReset={spectrogram.reset}
            onDrag={spectrogram.enableDrag}
            onZoom={spectrogram.enableZoom}
          />
        )}
        {withSettings && (
          <SpectrogramSettings
            samplerate={recording.samplerate}
            settings={spectrogram.parameters}
            onChange={spectrogram.setParameters}
            onReset={spectrogram.resetParameters}
            onSave={() => onParameterSave?.(spectrogram.parameters)}
          />
        )}
        {withPlayer && <Player {...audio} />}
      </div>
      <div className="overflow-hidden rounded-md" style={{ height }}>
        <canvas ref={canvasRef} {...props} className="w-full h-full" />
      </div>
      {withBar && (
        <SpectrogramBar
          bounds={spectrogram.bounds}
          viewport={spectrogram.viewport}
          onMove={spectrogram.zoom}
        />
      )}
    </Card>
  );
}
