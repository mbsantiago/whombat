import { useCallback, useMemo } from "react";
import { DEFAULT_SPECTROGRAM_PARAMETERS } from "@/api/spectrograms";
import Card from "@/components/Card";
import SpectrogramBar from "@/components/spectrograms/SpectrogramBar";
import SpectrogramControls from "@/components/spectrograms/SpectrogramControls";
import Canvas from "@/components/spectrograms/Canvas";
import Player from "@/components/audio/Player";

import useViewport from "@/hooks/window/useViewport";
import drawOnset from "@/draw/onset";
import drawTimeAxis from "@/draw/timeAxis";
import drawFreqAxis from "@/draw/freqAxis";
import useAudioSettings, {
  getSpeedOptions,
} from "@/hooks/settings/useAudioSettings";
import useSpectrogramSettings from "@/hooks/settings/useSpectrogramSettings";
import useRecordingAudio from "@/hooks/audio/useRecordingAudio";
import useRecordingSpectrogram from "@/hooks/spectrogram/useRecordingSpectrogram";
import { getInitialViewingWindow } from "@/utils/windows";
import useViewportNavigation from "@/hooks/interactions/useViewportNavigation";
import { scaleTimeToViewport } from "@/utils/geometry";
import type {
  Recording,
  SpectrogramParameters,
  SpectrogramWindow,
} from "@/types";

export default function RecordingSpectrogram({
  recording,
  height = 384,
  parameters = DEFAULT_SPECTROGRAM_PARAMETERS,
}: {
  recording: Recording;
  height?: number;
  parameters?: SpectrogramParameters;
}) {
  const {
    viewport: current,
    bounds,
    centerOn,
    expand,
    shift,
    save,
  } = useViewport({
    initial: getInitialViewingWindow({
      startTime: 0,
      endTime: recording.duration,
      samplerate: recording.samplerate,
      parameters,
    }),
    bounds: {
      time: { min: 0, max: recording.duration },
      freq: { min: 0, max: recording.samplerate / 2 },
    },
  });

  const onTimeUpdate = useCallback(
    (time: number) => {
      const { min, max } = current.time;
      const duration = max - min;
      if (time >= max - 0.1 * duration) {
        centerOn({ time: time + 0.4 * duration });
      } else if (time <= min + 0.1 * duration) {
        centerOn({ time: time - 0.4 * duration });
      }
    },
    [current.time, centerOn],
  );

  const { setSpeed, adjustToRecording } = useAudioSettings({
    initialSettings: {
      samplerate: recording.samplerate,
      channel: 0,
      speed: 1,
      filter_order: 1,
      resample: false,
    },
  });

  const audioSettings = useMemo(() => {
    return adjustToRecording(recording);
  }, [adjustToRecording, recording]);

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

  const { drawFn: drawSpectrogram } = useRecordingSpectrogram({
    recording,
    audioSettings,
    spectrogramSettings,
    viewport: current,
  });

  const audio = useRecordingAudio({
    recording,
    startTime: bounds.time.min,
    endTime: bounds.time.max,
    settings: audioSettings,
    onTimeUpdate,
  });

  const drawFn = useCallback(
    (ctx: CanvasRenderingContext2D, viewport: SpectrogramWindow) => {
      const time = scaleTimeToViewport(
        audio.currentTime,
        viewport,
        ctx.canvas.width,
      );
      drawSpectrogram(ctx, viewport);
      drawOnset(ctx, time);
      drawTimeAxis(ctx, viewport.time);
      drawFreqAxis(ctx, viewport.freq);
    },
    [audio.currentTime, drawSpectrogram],
  );

  const spectrogramBarProps = useViewportNavigation({
    centerOn,
    expand,
    shift,
    save,
  });

  const speedOptions = useMemo(() => {
    return getSpeedOptions(recording.samplerate);
  }, [recording.samplerate]);

  return (
    <Card>
      <div className="flex flex-row gap-4">
        <SpectrogramControls canDrag={true} canZoom={false} />
        <Player {...audio} setSpeed={setSpeed} speedOptions={speedOptions} />
      </div>
      <Canvas drawFn={drawFn} height={height} viewport={current} />
      <SpectrogramBar
        bounds={bounds}
        viewport={current}
        {...spectrogramBarProps}
      />
    </Card>
  );
}
