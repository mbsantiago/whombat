/** State for application wide spectrogram and audio parameters */
import { StateCreator } from "zustand";

import { DEFAULT_AUDIO_SETTINGS } from "@/lib/constants";
import type { AudioSettings } from "@/lib/types";

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
