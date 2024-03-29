/** State for application wide spectrogram and audio parameters */

import { StateCreator } from "zustand";

import { DEFAULT_SPECTROGRAM_PARAMETERS } from "@/api/spectrograms";

import type { SpectrogramParameters } from "@/types";

export type SpectrogramSlice = {
  spectrogramSettings: SpectrogramParameters;
  setSpectrogramSettings: (settings: SpectrogramParameters) => void;
};

export const createSpectrogramSlice: StateCreator<SpectrogramSlice> = (
  set,
) => ({
  spectrogramSettings: DEFAULT_SPECTROGRAM_PARAMETERS,
  setSpectrogramSettings: (settings) => {
    set((state) => {
      return {
        ...state,
        spectrogramSettings: settings,
      };
    });
  },
});
