import type { Recording } from "./recording";

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
