import { useCallback, useMemo } from "react";

import api from "@/app/api";
import useAudio from "@/lib/hooks/audio/useAudio";

import type { Recording, AudioSettings } from "@/lib/types";

export type AudioController = {
  startTime: number;
  endTime: number;
  volume: number;
  currentTime: number;
  speed: number;
  loop: boolean;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleLoop: () => void;
  togglePlay: () => void;
};

export default function useRecordingAudio({
  recording,
  startTime,
  endTime,
  settings,
  urlFn = api.audio.getStreamUrl,
  onTimeUpdate,
  ...handlers
}: {
  recording: Recording;
  startTime: number;
  endTime: number;
  settings: AudioSettings;
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
  onSeeking?: () => void;
  onWaiting?: () => void;
  onLoadStart?: () => void;
  onLoadedData?: () => void;
  onCanPlay?: () => void;
  onCanPlayThrough?: () => void;
  onAbort?: () => void;
}): AudioController {
  const { speed } = settings;

  const url = useMemo(
    () =>
      urlFn({
        recording,
        startTime,
        endTime,
        settings,
      }),
    [recording, startTime, endTime, settings, urlFn],
  );

  const handleTimeUpdate = useCallback(
    (time: number) => {
      onTimeUpdate?.(time * speed + startTime);
    },
    [onTimeUpdate, speed, startTime],
  );

  const audio = useAudio({
    url,
    onTimeUpdate: handleTimeUpdate,
    ...handlers,
  });

  const seek = useCallback(
    (time: number) => {
      audio.seek((time - startTime) / speed);
    },
    [audio, speed, startTime],
  );

  return {
    startTime,
    endTime,
    speed,
    currentTime: audio.currentTime * speed + startTime,
    volume: audio.volume,
    loop: audio.loop,
    isPlaying: audio.isPlaying,
    togglePlay: audio.togglePlay,
    play: audio.play,
    pause: audio.pause,
    stop: audio.stop,
    setVolume: audio.setVolume,
    toggleLoop: audio.toggleLoop,
    seek,
  };
}
