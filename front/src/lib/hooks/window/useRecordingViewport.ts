import { useMemo } from "react";

import {
  DEFAULT_SPECTROGRAM_SETTINGS,
  DEFAULT_VIEW_SETTINGS,
} from "@/lib/constants";
import useViewport from "@/lib/hooks/window/useViewport";
import type { Recording, SpectrogramSettings, ViewSettings } from "@/lib/types";
import { getInitialViewingWindow } from "@/lib/utils/windows";

export default function useRecordingViewport({
  recording,
  startTime = 0,
  endTime,
  spectrogramSettings = DEFAULT_SPECTROGRAM_SETTINGS,
  viewSettings = DEFAULT_VIEW_SETTINGS,
}: {
  recording: Recording;
  startTime?: number;
  endTime?: number;
  spectrogramSettings?: SpectrogramSettings;
  viewSettings?: ViewSettings;
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
    viewSettings,
  });

  const viewport = useViewport({
    initial,
    bounds,
  });

  return viewport;
}
