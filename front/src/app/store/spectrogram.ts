/** State for application wide spectrogram and audio parameters */
import { StateCreator } from "zustand";

import { DEFAULT_SPECTROGRAM_SETTINGS } from "@/lib/constants";
import type { SpectrogramSettings } from "@/lib/types";

export type SpectrogramSlice = {
  spectrogramSettings: SpectrogramSettings;
  setSpectrogramSettings: (settings: SpectrogramSettings) => void;
};

export const createSpectrogramSlice: StateCreator<SpectrogramSlice> = (
  set,
) => ({
  spectrogramSettings: DEFAULT_SPECTROGRAM_SETTINGS,
  setSpectrogramSettings: (settings) => {
    set((state) => {
      return {
        ...state,
        spectrogramSettings: settings,
      };
    });
  },
});
