import { useMachine } from "@xstate/react";
import { useCallback, useMemo, useState } from "react";

import api from "@/app/api";
import { audioMachine } from "@/machines/audio";

import type { Recording } from "@/types";

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

export type SpeedOption = {
  label: string;
  value: number;
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
  { label: "0.1x", value: 0.1 },
  { label: "0.25x", value: 0.25 },
  { label: "0.5x", value: 0.5 },
  { label: "0.75x", value: 0.75 },
  { label: "1.2x", value: 1.2 },
  { label: "1.5x", value: 1.5 },
  { label: "1.75x", value: 1.75 },
  { label: "2x", value: 2 },
  { label: "3x", value: 3 },
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

export default function useAudio({
  recording,
  endTime,
  startTime = 0,
  speed: initialSpeed,
}: { recording: Recording } & Partial<PlayerState>): PlayerState &
  PlayerControls {
  const speedOptions = useMemo(() => getSpeedOptions(recording), [recording]);
  const defaultSpeedOption = useMemo(
    () => getDefaultSpeedOption(speedOptions),
    [speedOptions],
  );

  // Store internal player state
  const [speed, setSpeed] = useState<number>(
    initialSpeed || defaultSpeedOption.value,
  );

  const initialUrl = useMemo(() => {
    return api.audio.getStreamUrl({
      recording,
      startTime,
      endTime,
      speed: speed,
    });
  }, [recording, startTime, endTime, speed]);

  // Initialize audio machine
  const [machineState, send] = useMachine(audioMachine, {
    input: {
      url: initialUrl,
    },
  });

  // Export player state
  const { currentTime, volume, loop } = machineState.context;
  const isPlaying = machineState.matches("playing");

  const handlePlay = useCallback(() => {
    send({ type: "audio.play" });
  }, [send]);

  const handlePause = useCallback(() => {
    send({ type: "audio.pause" });
  }, [send]);

  const handleStop = useCallback(() => {
    send({ type: "audio.stop" });
  }, [send]);

  const handleSetVolume = useCallback(
    (volume: number) => {
      send({ type: "audio.set_volume", volume });
    },
    [send],
  );

  const handleToggleLoop = useCallback(() => {
    send({ type: "audio.toggle_loop" });
  }, [send]);

  const handleSeek = useCallback(
    (time: number) => {
      send({ type: "audio.seek", time: (time - startTime) / speed });
    },
    [send, speed, startTime],
  );

  const handleSetSpeed = useCallback(
    (newSpeed: number) => {
      setSpeed(newSpeed);
      const url = api.audio.getStreamUrl({
        recording,
        startTime,
        endTime,
        speed: newSpeed,
      });
      send({
        type: "audio.change_url",
        url,
        play: true,
      });
    },
    [send, recording, startTime, endTime],
  );

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  }, [isPlaying, handlePlay, handlePause]);

  return {
    startTime,
    endTime: endTime || recording.duration,
    volume,
    currentTime: currentTime * speed + startTime,
    speed,
    loop,
    isPlaying,
    speedOptions,
    togglePlay: handleTogglePlay,
    play: handlePlay,
    pause: handlePause,
    stop: handleStop,
    setVolume: handleSetVolume,
    toggleLoop: handleToggleLoop,
    seek: handleSeek,
    setSpeed: handleSetSpeed,
  };
}
