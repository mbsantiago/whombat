import { useRef, useCallback } from "react";
import { useMemo } from "react";

import useCanvas from "@/hooks/draw/useCanvas";
import useAudio from "@/hooks/audio/useAudio";
import useSpectrogram from "@/hooks/spectrogram/useSpectrogram";
import useSpectrogramTrackAudio from "@/hooks/spectrogram/useSpectrogramTrackAudio";
import Card from "@/components/Card";
import Player from "@/components/audio/Player";
import SpectrogramBar from "@/components/spectrograms/SpectrogramBar";
import SpectrogramSettings from "@/components/spectrograms/SpectrogramSettings";
import SpectrogramControls from "@/components/spectrograms/SpectrogramControls";
import { type Recording } from "@/api/schemas";
import {
  type SpectrogramParameters,
  DEFAULT_SPECTROGRAM_PARAMETERS,
} from "@/api/spectrograms";

export default function RecordingSpectrogram({
  recording,
  parameters = DEFAULT_SPECTROGRAM_PARAMETERS,
}: {
  recording: Recording;
  parameters?: SpectrogramParameters;
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

  const spectrogram = useSpectrogram({
    dimensions,
    recording,
    bounds,
    initial,
    parameters,
  });

  const audio = useAudio({
    recording,
    endTime: bounds.time.max,
    startTime: bounds.time.min,
  });

  const { draw: drawTrackAudio } = useSpectrogramTrackAudio({
    viewport: spectrogram.state.viewport,
    currentTime: audio.state.currentTime,
    isPlaying: audio.state.playing,
    onTimeChange: (time) => spectrogram.controls.centerOn({ time }),
  });

  const {
    props,
    draw: drawSpectrogram,
    state: { isLoading: spectrogramIsLoading },
  } = spectrogram;

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (spectrogramIsLoading) return;
      drawSpectrogram(ctx);
      drawTrackAudio(ctx);
    },
    [drawSpectrogram, drawTrackAudio, spectrogramIsLoading],
  );

  useCanvas({ ref: canvasRef, draw });

  return (
    <Card>
      <div className="flex flex-row gap-2">
        <SpectrogramControls
          canDrag={spectrogram.state.canDrag}
          canZoom={spectrogram.state.canZoom}
          onReset={() => spectrogram.controls.reset()}
          onDrag={() => spectrogram.controls.enableDrag()}
          onZoom={() => spectrogram.controls.enableZoom()}
        />
        <SpectrogramSettings
          settings={spectrogram.state.parameters}
          onChange={(key, value) =>
            spectrogram.controls.setParameter(key, value)
          }
          onClear={(key) => spectrogram.controls.clearParameter(key)}
        />
        <Player state={audio.state} controls={audio.controls} />
      </div>
      <div className="overflow-hidden h-96 rounded-md">
        <canvas ref={canvasRef} {...props} className="w-full h-full" />
      </div>
      <SpectrogramBar
        bounds={spectrogram.state.bounds}
        viewport={spectrogram.state.viewport}
        onMove={spectrogram.controls.zoom}
      />
    </Card>
  );
}
