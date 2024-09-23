import { useCallback, useMemo } from "react";

import useRecordingAudio from "@/app/hooks/audio/useRecordingAudio";

import { adjustToRecording } from "@/lib/hooks/settings/useAudioSettings";

import type { AudioSettings, Recording, ViewportController } from "@/lib/types";

/** A custom React hook to manage audio playback synchronized with a
 * spectrogram viewport.
 */
export default function useSpectrogramAudio({
  recording,
  viewport,
  audioSettings,
  onSeek,
  onTimeUpdate,
  ...handlers
}: {
  /** The viewport controller. */
  viewport: ViewportController;
  /** The recording object. */
  recording: Recording;
  /** The audio settings. */
  audioSettings: AudioSettings;
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
  const { viewport: current, centerOn, bounds } = viewport;

  // Adjust audio settings for compatibility with the recording
  const adjustedAudioSettings = useMemo(() => {
    return adjustToRecording(audioSettings, recording);
  }, [audioSettings, recording]);

  // Callback function to be executed when the audio playback time updates.
  // If the playback time is close to the edge of the current viewport,
  // this function will shift the viewport to keep the playback time visible.
  const handleTimeUpdate = useCallback(
    (time: number) => {
      const { min, max } = current.time;
      const duration = max - min;
      if (time >= max - 0.1 * duration) {
        centerOn({ time: time + 0.4 * duration });
      } else if (time <= min + 0.1 * duration) {
        centerOn({ time: time - 0.4 * duration });
      }
      onTimeUpdate?.(time);
    },
    [current.time, centerOn, onTimeUpdate],
  );

  // Callback function to be executed when the user seeks to a specific time.
  // This function will center the viewport on the specified time.
  // It will also call the `onSeek` callback function if provided.
  const handleSeek = useCallback(
    (time: number) => {
      centerOn({ time });
      onSeek?.(time);
    },
    [centerOn, onSeek],
  );

  return useRecordingAudio({
    recording,
    startTime: bounds.time.min,
    endTime: bounds.time.max,
    audioSettings: adjustedAudioSettings,
    onTimeUpdate: handleTimeUpdate,
    onSeek: handleSeek,
    ...handlers,
  });
}
