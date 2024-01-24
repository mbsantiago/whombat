import { useCallback, useMemo, useState, useRef, useEffect } from "react";

import api from "@/app/api";
import useAudioKeyShortcuts from "@/hooks/audio/useAudioKeyShortcuts";

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
  withShortcuts = true,
}: {
  recording: Recording;
  withShortcuts?: boolean;
} & Partial<PlayerState>): PlayerState & PlayerControls {
  const audio = useRef<HTMLAudioElement>(new Audio());

  const speedOptions = useMemo(() => getSpeedOptions(recording), [recording]);
  const defaultSpeedOption = useMemo(
    () => getDefaultSpeedOption(speedOptions),
    [speedOptions],
  );

  // Store internal player state
  const [speed, setSpeed] = useState<number>(
    initialSpeed || defaultSpeedOption.value,
  );
  const [time, setTime] = useState<number>(startTime);
  const [loop, setLoop] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const initialUrl = useMemo(() => {
    return api.audio.getStreamUrl({
      recording,
      startTime,
      endTime,
      speed: speed,
    });
  }, [recording, startTime, endTime, speed]);

  useEffect(() => {
    const { current } = audio;
    current.preload = "none";
    current.src = initialUrl;
    current.loop = loop;
    current.volume = volume;

    setIsPlaying(false);
    setTime(startTime);

    let timer: number;

    const updateTime = () => {
      if (current.paused) return;
      const currentTime = current.currentTime * speed + startTime;
      setTime(currentTime);
      timer = requestAnimationFrame(updateTime);
    };

    timer = requestAnimationFrame(updateTime);

    const onPlay = () => {
      timer = requestAnimationFrame(updateTime);
    };

    const onPause = () => {
      cancelAnimationFrame(timer);
    };

    const onError = () => {
      cancelAnimationFrame(timer);
    }

    current.addEventListener("play", onPlay);
    current.addEventListener("pause", onPause);
    current.addEventListener("error", onError);

    return () => {
      cancelAnimationFrame(timer);
      current.removeEventListener("play", onPlay);
      current.removeEventListener("pause", onPause);
      current.removeEventListener("error", onError);
    };
  }, [initialUrl, speed, startTime, loop, volume]);


  // Some browsers return `Promise` on `.play()` and may throw errors
  // if one tries to execute another `.play()` or `.pause()` while that
  // promise is resolving. So we prevent that with this lock.
  // See: https://bugs.chromium.org/p/chromium/issues/detail?id=593273
  let lockPlay = useRef<boolean>(false);

  const handlePlay = useCallback(() => {
    if (lockPlay.current) return;
    const promise = audio.current.play();

    if (promise) {
      lockPlay.current = true;
      promise
        .then(() => {
          setIsPlaying(true);
          lockPlay.current = false;
        })
        .catch(() => {
          lockPlay.current = false;
        });
    } else {
      setIsPlaying(true);
    }
  }, []);

  const handlePause = useCallback(() => {
    audio.current.pause();
    setIsPlaying(false);
  }, []);

  const handleStop = useCallback(() => {
    audio.current.pause();
    audio.current.currentTime = 0;
    setTime(startTime);
    setIsPlaying(false);
  }, [startTime]);

  const handleSetVolume = useCallback((volume: number) => {
    audio.current.volume = volume;
    setVolume(volume);
  }, []);

  const handleSeek = useCallback((time: number) => {
    audio.current.currentTime = time;
  }, []);

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  }, [isPlaying, handlePlay, handlePause]);

  const handleToggleLoop = useCallback(() => {
    audio.current.loop = !audio.current.loop;
    setLoop(audio.current.loop);
  }, []);

  useAudioKeyShortcuts({
    onTogglePlay: handleTogglePlay,
    enabled: withShortcuts,
  });

  return {
    startTime,
    endTime: endTime || recording.duration,
    volume,
    currentTime: time,
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
    setSpeed,
  };
}
