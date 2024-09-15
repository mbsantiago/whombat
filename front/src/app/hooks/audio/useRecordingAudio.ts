import { useCallback, useMemo } from "react";
import api from "@/app/api";

import useAudio from "@/lib/hooks/audio/useAudio";

import type { Recording, AudioSettings } from "@/lib/types";

export default function useRecordingAudio({
  recording,
  startTime,
  endTime,
  audioSettings,
  onTimeUpdate,
  onSeek,
  ...handlers
}: {
  recording: Recording;
  startTime: number;
  endTime: number;
  audioSettings: AudioSettings;
  onSeek?: (time: number) => void;
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
  const { speed } = audioSettings;

  const url = useMemo(
    () =>
      api.audio.getStreamUrl({
        recording,
        startTime,
        endTime,
        // TODO: Fix this
        // settings: audioSettings,
      }),
    [recording, startTime, endTime],
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
      let adjustedTime = (time - startTime) / speed;
      audio.seek(adjustedTime);
      onSeek?.(adjustedTime);
    },
    [audio, speed, startTime, onSeek],
  );

  return {
    recording,
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

export type AudioState = {
  recording: Recording;
  startTime: number;
  endTime: number;
  volume: number;
  currentTime: number;
  speed: number;
  loop: boolean;
  isPlaying: boolean;
};

export type AudioControls = {
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleLoop: () => void;
  togglePlay: () => void;
};

export type AudioController = AudioState & AudioControls;
