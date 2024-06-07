/* Constants used throughout the application */

/* Default values for the settings of the STFT computation
 */
export const MAX_SAMPLERATE = 500_000;
export const MIN_SAMPLERATE = 4000;
export const MIN_DB = -140;
export const DEFAULT_WINDOW_SIZE = 0.00319;
export const DEFAULT_HOP_SIZE = 0.03125;
export const DEFAULT_WINDOW = "blackmanharris";
export const DEFAULT_SCALE = "dB";
export const DEFAULT_FILTER_ORDER = 5;
export const DEFAULT_CMAP = "brg";

/* Restrictions on the settings for the STFT computation
 * These are to prevent the user from setting parameters that
 * would cause the STFT to fail or be too slow
 */
export const MAX_FFT_SIZE = 2 ** 13;
export const MIN_FFT_SIZE = 2 ** 7;
export const MAX_HOP_FRACTION = 1; // 100% of window size
export const MIN_HOP_FRACTION = 0.01; // 1% of window size

/** Absolute maximum frequency that can be handled by the app */
export const MAX_FREQ = 5_000_000;
