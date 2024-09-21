/** State for application wide spectrogram and audio parameters */
import { DEFAULT_AUDIO_SETTINGS } from "@/lib/constants";
import type { AudioSettings } from "@/lib/types";
import { StateCreator } from "zustand";

export type AudioSlice = {
  audioSettings: AudioSettings;
  setAudioSettings: (settings: AudioSettings) => void;
};

export const createAudioSlice: StateCreator<AudioSlice> = (set) => ({
  audioSettings: DEFAULT_AUDIO_SETTINGS,
  setAudioSettings: (settings) => {
    set((state) => {
      return {
        ...state,
        audioSettings: settings,
      };
    });
  },
});
