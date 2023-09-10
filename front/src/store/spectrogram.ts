/** State for application wide spectrogram and audio parameters */

import { type SpectrogramParameters, DEFAULT_SPECTROGRAM_PARAMETERS } from "@/api/spectrograms";
import { StateCreator } from "zustand";

export type SpectrogramSlice = {
  spectrogramSettings: SpectrogramParameters;
  setSpectrogramSettings: (settings: Partial<SpectrogramParameters>) => void;
};

export const createSpectrogramSlice: StateCreator<SpectrogramSlice> = (
  set,
) => ({
  spectrogramSettings: DEFAULT_SPECTROGRAM_PARAMETERS,
  setSpectrogramSettings: (settings) => {
    set((state) => {
      const { spectrogramSettings: currentSettings } = state;
      return {
        ...state,
        spectrogramSettings: {
          ...currentSettings,
          ...settings,
        },
      };
    });
  },
});
