import { useCallback, useMemo, useState, useEffect } from "react";

import api from "@/app/api";
import useAudio from "@/hooks/audio/useAudio";

import type { Recording } from "@/types";

export type SpeedOption = {
  label: string;
  value: number;
};

export type PlayerControls = {
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setSpeed: (speed: number) => void;
  toggleLoop: () => void;
  togglePlay: () => void;
};

export type PlayerState = {
  startTime: number;
  endTime: number;
  volume: number;
  currentTime: number;
  speed: number;
  loop: boolean;
  isPlaying: boolean;
  speedOptions: SpeedOption[];
};

const LOWEST_SAMPLE_RATE = 8000;
const HIGHTEST_SAMPLE_RATE = 96000;

const ALL_SPEED_OPTIONS: SpeedOption[] = [
  { label: "1x", value: 1 },
  { label: "1.2x", value: 1.2 },
  { label: "1.5x", value: 1.5 },
  { label: "1.75x", value: 1.75 },
  { label: "2x", value: 2 },
  { label: "3x", value: 3 },
  { label: "0.75x", value: 0.75 },
  { label: "0.5x", value: 0.5 },
  { label: "0.25x", value: 0.25 },
  { label: "0.1x", value: 0.1 },
];

function getSpeedOptions(recording: Recording): SpeedOption[] {
  return ALL_SPEED_OPTIONS.filter((option) => {
    const sampleRate = recording.samplerate;
    const speed = option.value;
    const newSampleRate = sampleRate * speed;
    return (
      newSampleRate >= LOWEST_SAMPLE_RATE &&
      newSampleRate <= HIGHTEST_SAMPLE_RATE
    );
  });
}

function getDefaultSpeedOption(options: SpeedOption[]): SpeedOption {
  return options.find((option) => option.value === 1) || options[0];
}

export default function useRecordingAudio({
  recording,
  startTime,
  endTime,
  speed: initialSpeed,
  urlFn = api.audio.getStreamUrl,
  onTimeUpdate,
  ...handlers
}: {
  recording: Recording;
  startTime: number;
  endTime: number;
  speed?: number;
  urlFn?: (args: {
    recording: Recording;
    startTime?: number;
    endTime?: number;
    speed?: number;
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
}) {
  const speedOptions = useMemo(() => getSpeedOptions(recording), [recording]);

  const defaultSpeedOption = useMemo(
    () => getDefaultSpeedOption(speedOptions),
    [speedOptions],
  );

  const [speed, setSpeed] = useState<number>(
    initialSpeed || defaultSpeedOption.value,
  );

  const url = useMemo(
    () =>
      urlFn({
        recording,
        startTime,
        endTime,
        speed,
      }),
    [recording, startTime, endTime, speed, urlFn],
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
    speedOptions,
    setSpeed,
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
