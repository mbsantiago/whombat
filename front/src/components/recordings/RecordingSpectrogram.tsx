import { useMemo } from "react";
import { DEFAULT_SPECTROGRAM_PARAMETERS } from "@/api/spectrograms";
import Card from "@/components/Card";
import SpectrogramBar from "@/components/spectrograms/SpectrogramBar";
import ViewportToolbar from "@/components/spectrograms/ViewportToolbar";
import Canvas from "@/components/spectrograms/Canvas";
import Player from "@/components/audio/Player";

import useAudioSettings, {
  getSpeedOptions,
} from "@/hooks/settings/useAudioSettings";
import useSpectrogramSettings from "@/hooks/settings/useSpectrogramSettings";
import useSpectrogram from "@/hooks/spectrogram/useSpectrogram";
import type { Recording, SpectrogramParameters } from "@/types";

export default function RecordingSpectrogram({
  recording,
  height = 384,
  parameters = DEFAULT_SPECTROGRAM_PARAMETERS,
}: {
  recording: Recording;
  height?: number;
  parameters?: SpectrogramParameters;
}) {
  const { settings: audioSettings, setSpeed } = useAudioSettings({
    initialSettings: {
      samplerate: recording.samplerate,
      channel: 0,
      speed: 1,
      filter_order: 1,
      resample: false,
    },
  });

  const { settings: spectrogramSettings } = useSpectrogramSettings({
    initialSettings: {
      window_size: parameters.window_size,
      hop_size: parameters.hop_size,
      window: parameters.window as any,
      scale: parameters.scale,
      clamp: parameters.clamp,
      min_dB: parameters.min_dB,
      max_dB: parameters.max_dB,
      normalize: parameters.normalize,
      pcen: parameters.pcen,
      cmap: parameters.cmap as any,
    },
  });

  const bounds = useMemo(
    () => ({
      time: { min: 0, max: recording.duration },
      freq: { min: 0, max: recording.samplerate / 2 },
    }),
    [recording.duration, recording.samplerate],
  );

  const { viewport, audio, state, barProps, canvasProps } =
    useSpectrogram({
      recording,
      audioSettings,
      spectrogramSettings,
      bounds,
    });

  const { viewport: current, reset, back } = viewport;

  const speedOptions = useMemo(() => {
    return getSpeedOptions(recording.samplerate);
  }, [recording.samplerate]);

  return (
    <Card>
      <div className="flex flex-row gap-4">
        <ViewportToolbar
          state={state.state}
          onResetClick={reset}
          onBackClick={back}
          onDragClick={state.enablePanning}
          onZoomClick={state.enableZooming}
        />
        <Player {...audio} setSpeed={setSpeed} speedOptions={speedOptions} />
      </div>
      <Canvas height={height} viewport={current} {...canvasProps} />
      <SpectrogramBar bounds={bounds} viewport={current} {...barProps} />
    </Card>
  );
}
