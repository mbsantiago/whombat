/* Constants used throughout the application */
import type {
  AudioSettings,
  SpectrogramParameters,
  SpectrogramSettings,
} from "@/lib/types";

/* Default values for the settings of the STFT computation
 */
export const MAX_SAMPLERATE = 500_000;
export const MIN_SAMPLERATE = 4000;
export const MIN_DB = -140;
export const DEFAULT_WINDOW_SIZE = 0.025;
export const DEFAULT_OVERLAP = 0.5;
export const DEFAULT_WINDOW = "hann";
export const DEFAULT_SCALE = "dB";
export const DEFAULT_FILTER_ORDER = 5;
export const DEFAULT_CMAP = "gray";

/* Restrictions on the settings for the STFT computation
 * These are to prevent the user from setting parameters that
 * would cause the STFT to fail or be too slow
 */
export const MAX_FFT_SIZE = 2 ** 13;
export const MIN_FFT_SIZE = 2 ** 7;
export const MAX_HOP_FRACTION = 1; // 100% of window size
export const MIN_HOP_FRACTION = 0.1; // 10% of window size

/** Absolute maximum frequency that can be handled by the app */
export const MAX_FREQ = 5_000_000;

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  resample: false,
  samplerate: null,
  channel: 0,
  low_freq: null,
  high_freq: null,
  filter_order: 4,
  speed: 1,
};

export const DEFAULT_SPECTROGRAM_SETTINGS: SpectrogramSettings = {
  window_size: DEFAULT_WINDOW_SIZE,
  overlap: DEFAULT_OVERLAP,
  window: DEFAULT_WINDOW,
  scale: DEFAULT_SCALE,
  clamp: false,
  min_dB: MIN_DB,
  max_dB: 0,
  normalize: true,
  pcen: false,
  cmap: DEFAULT_CMAP,
};

export const DEFAULT_SPECTROGRAM_PARAMETERS: SpectrogramParameters = {
  ...DEFAULT_AUDIO_SETTINGS,
  ...DEFAULT_SPECTROGRAM_SETTINGS,
};
