/** State for application wide spectrogram and audio parameters */

import { StateCreator } from "zustand";

import { DEFAULT_SPECTROGRAM_PARAMETERS, type SpectrogramParameters } from "@/api/spectrograms";

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
