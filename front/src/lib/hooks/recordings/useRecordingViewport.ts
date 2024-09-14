import { useMemo } from "react";
import type { Recording, SpectrogramSettings } from "@/lib/types";
import useViewport from "@/lib/hooks/window/useViewport";
import { getInitialViewingWindow } from "@/lib/utils/windows";
import { DEFAULT_SPECTROGRAM_SETTINGS } from "@/lib/constants";

export default function useRecordingViewport({
  recording,
  startTime = 0,
  endTime,
  spectrogramSettings = DEFAULT_SPECTROGRAM_SETTINGS,
}: {
  recording: Recording;
  startTime?: number;
  endTime?: number;
  spectrogramSettings?: SpectrogramSettings;
}) {
  const bounds = useMemo(
    () => ({
      time: { min: startTime, max: endTime || recording.duration },
      freq: { min: 0, max: recording.samplerate / 2 },
    }),
    [recording.duration, recording.samplerate, startTime, endTime],
  );

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

  return viewport;
}
