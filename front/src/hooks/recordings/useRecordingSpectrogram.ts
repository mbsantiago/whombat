import { useMemo, useEffect } from "react";
import useSpectrogram from "@/hooks/spectrogram/useSpectrogram";
import type { Recording, AudioSettings, SpectrogramSettings } from "@/types";
import { getInitialViewingWindow } from "@/utils/windows";

export default function useRecordingSpectrogram({
  recording,
  audioSettings,
  spectrogramSettings,
}: {
  recording: Recording;
  audioSettings: AudioSettings;
  spectrogramSettings: SpectrogramSettings;
}) {
  const bounds = useMemo(
    () => ({
      time: { min: 0, max: recording.duration },
      freq: { min: 0, max: recording.samplerate / 2 },
    }),
    [recording.duration, recording.samplerate],
  );

  const { viewport, audio, state, barProps, canvasProps } = useSpectrogram({
    recording,
    audioSettings,
    spectrogramSettings,
    bounds,
  });

  // Reset the initial viewport when the recording changes
  const { set: setViewport } = viewport;
  useEffect(() => {
    setViewport(
      getInitialViewingWindow({
        startTime: 0,
        endTime: 2,
        samplerate: recording.samplerate,
        windowSize: spectrogramSettings.window_size,
        overlap: spectrogramSettings.overlap,
      }),
    );
  }, [
    recording,
    spectrogramSettings.window_size,
    spectrogramSettings.overlap,
    setViewport,
  ]);

  return {
    viewport,
    bounds,
    audio,
    state,
    barProps,
    canvasProps,
  };
}
