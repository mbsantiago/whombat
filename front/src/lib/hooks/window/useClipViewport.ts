import { useEffect, useMemo } from "react";

import {
  DEFAULT_SPECTROGRAM_SETTINGS,
  DEFAULT_VIEW_SETTINGS,
} from "@/lib/constants";
import useViewport from "@/lib/hooks/window/useViewport";
import type { Clip, SpectrogramSettings, ViewSettings } from "@/lib/types";
import { getInitialViewingWindow } from "@/lib/utils/windows";

export default function useClipViewport({
  clip,
  spectrogramSettings = DEFAULT_SPECTROGRAM_SETTINGS,
  viewSettings = DEFAULT_VIEW_SETTINGS,
}: {
  clip: Clip;
  spectrogramSettings?: SpectrogramSettings;
  viewSettings?: ViewSettings;
}) {
  const bounds = useMemo(
    () => ({
      time: { min: clip.start_time, max: clip.end_time },
      freq: { min: 0, max: clip.recording.samplerate / 2 },
    }),
    [clip.recording.samplerate, clip.start_time, clip.end_time],
  );

  const initial = useMemo(
    () =>
      getInitialViewingWindow({
        startTime: bounds.time.min,
        endTime: bounds.time.max,
        samplerate: clip.recording.samplerate,
        windowSize: spectrogramSettings.window_size,
        overlap: spectrogramSettings.overlap,
        viewSettings,
      }),
    [
      bounds,
      clip.recording.samplerate,
      spectrogramSettings.window_size,
      spectrogramSettings.overlap,
      viewSettings,
    ],
  );

  const viewport = useViewport({
    initial,
    bounds,
  });

  const { set: setViewport } = viewport;

  useEffect(() => {
    setViewport(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clip.uuid, setViewport]);

  return viewport;
}
