import { useMemo } from "react";
import type {
  SpectrogramSettings,
  SpectrogramParameters,
  AudioSettings,
} from "@/lib/types";

export default function useSpectrogramParameters({
  audioSettings,
  spectrogramSettings,
}: {
  audioSettings: AudioSettings;
  spectrogramSettings: SpectrogramSettings;
}): SpectrogramParameters {
  const { channel, resample, samplerate, low_freq, high_freq, filter_order } =
    audioSettings;
  const {
    window_size,
    overlap,
    window,
    scale,
    cmap,
    min_dB,
    max_dB,
    normalize,
    pcen,
    clamp,
  } = spectrogramSettings;

  return useMemo(
    () => ({
      channel,
      resample,
      samplerate,
      low_freq,
      high_freq,
      filter_order,
      window_size,
      overlap,
      window,
      scale,
      cmap,
      min_dB,
      max_dB,
      normalize,
      pcen,
      clamp,
    }),
    [
      channel,
      resample,
      samplerate,
      low_freq,
      high_freq,
      filter_order,
      window_size,
      overlap,
      window,
      scale,
      cmap,
      min_dB,
      max_dB,
      normalize,
      pcen,
      clamp,
    ],
  );
}
