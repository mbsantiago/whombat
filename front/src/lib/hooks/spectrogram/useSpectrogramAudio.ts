/**
 * @module useSpectrogramAudio
 * A React hook for managing audio playback in the context of a spectrogram.
 */
import { useCallback, useMemo } from "react";

import useRecordingAudio from "@/app/hooks/audio/useRecordingAudio";
import { adjustToRecording } from "@/lib/hooks/settings/useAudioSettings";

import type { ViewportController } from "@/lib/hooks/window/useViewport";
import type { Recording, SpectrogramWindow, AudioSettings } from "@/lib/types";

/** A custom React hook to manage audio playback synchronized with a
 * spectrogram viewport.
 */
export default function useSpectrogramAudio({
  recording,
  bounds,
  viewport,
  audioSettings,
  ...handlers
}: {
  /** The viewport controller. */
  viewport: ViewportController;
  /** The recording object. */
  recording: Recording;
  /** The boundaries of the spectrogram display. */
  bounds: SpectrogramWindow;
  /** The audio settings. */
  audioSettings: AudioSettings;
  urlFn?: (args: {
    recording: Recording;
    startTime?: number;
    endTime?: number;
    settings?: AudioSettings;
  }) => string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: () => void;
  onTimeUpdate?: (time: number) => void;
  onVolumeChange?: (volume: number) => void;
  onSeek?: (time: number) => void;
  onSeeking?: () => void;
  onWaiting?: () => void;
  onLoadStart?: () => void;
  onLoadedData?: () => void;
  onCanPlay?: () => void;
  onCanPlayThrough?: () => void;
  onAbort?: () => void;
}) {
  const { viewport: current, centerOn } = viewport;

  // Callback function to be executed when the audio playback time updates.
  // If the playback time is close to the edge of the current viewport,
  // this function will shift the viewport to keep the playback time visible.
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

  // Adjust audio settings for compatibility with the recording
  const adjustedAudioSettings = useMemo(() => {
    return adjustToRecording(audioSettings, recording);
  }, [audioSettings, recording]);

  const handleSeek = useCallback(
    (time: number) => centerOn({ time }),
    [centerOn],
  );

  return useRecordingAudio({
    recording,
    startTime: bounds.time.min,
    endTime: bounds.time.max,
    audioSettings: adjustedAudioSettings,
    onTimeUpdate,
    onSeek: handleSeek,
    ...handlers,
  });
}
