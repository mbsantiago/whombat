import { useCallback, useState } from "react";
import { produce } from "immer";
import type { SpectrogramSettings } from "@/types";
import { SCALES, WINDOWS, COLORMAPS } from "@/schemas";

export type SpectrogramSettingsInterface = {
  /** The current spectrogram settings. */
  settings: SpectrogramSettings;
  /** Sets the window size for the spectrogram calculation. */
  setWindowSize: (windowSize: number) => void;
  /** Sets the overlap between consecutive windows. */
  setOverlap: (overlap: number) => void;
  /** Sets the scale for the spectrogram ('amplitude', 'power', or 'dB'). */
  setScale: (scale: (typeof SCALES)[number]) => void;
  /** Sets the window function for the spectrogram. */
  setWindow: (window: (typeof WINDOWS)[number]) => void;
  /** Sets the minimum and maximum dB range for the spectrogram. */
  setDBRange: (params: { min?: number; max?: number }) => void;
  /** Sets the colormap for the spectrogram. */
  setColormap: (colormap: (typeof COLORMAPS)[number]) => void;
  /** Toggles per-channel energy normalization (PCEN) on/off. */
  togglePCEN: () => void;
  /** Toggles normalization of the spectrogram on/off. */
  toggleNormalize: () => void;
  /** Resets the settings to their initial values and calls the optional
   * `onReset` callback. */
  reset: () => void;
};

/**
 * A React hook that provides an interface for managing spectrogram settings.
 * All setter functions include validation to ensure the settings remain valid,
 * and an `onError` callback is provided for handling invalid input. Any
 * changes to the settings are propagated to the `onChange` callback.
 */
export default function useSpectrogramSettings({
  initialSettings,
  onChange,
  onReset,
  onError,
}: {
  /** The initial values for the spectrogram settings. */
  initialSettings: SpectrogramSettings;
  /** A callback function that is triggered whenever the settings change. */
  onChange?: (settings: SpectrogramSettings) => void;
  /** An optional callback function that is called when the settings are reset.
   * */
  onReset?: () => void;
  /** An optional callback function that is called when an error occurs during
   * validation. */
  onError?: (error: Error) => void;
}): SpectrogramSettingsInterface {
  const [settings, setSettings] =
    useState<SpectrogramSettings>(initialSettings);

  const setWindowSize = useCallback(
    (windowSize: number) =>
      setSettings((prev) => {
        const next = produce(prev, (draft) => {
          if (windowSize <= 0) {
            onError?.(new Error("Window size must be greater than 0"));
            return;
          }

          draft.window_size = windowSize;
        });
        onChange?.(next);
        return next;
      }),
    [onChange, setSettings, onError],
  );

  const setOverlap = useCallback(
    (overlap: number) =>
      setSettings((prev) => {
        const next = produce(prev, (draft) => {
          if (overlap <= 0 || overlap >= 1) {
            onError?.(new Error("Overlap must be between 0 and 1"));
            return;
          }

          draft.hop_size = overlap;
        });
        onChange?.(next);
        return next;
      }),
    [onChange, setSettings, onError],
  );

  const setScale = useCallback(
    (scale: (typeof SCALES)[number]) =>
      setSettings((draft) => {
        if (!SCALES.includes(scale)) {
          onError?.(
            new Error(
              `Invalid spectrogram scale, must be one of ${SCALES.join(", ")}`,
            ),
          );
          return;
        }

        draft.scale = scale;
        onChange?.(draft);
      }),
    [onChange, setSettings, onError],
  );

  const setWindow = useCallback(
    (window: (typeof WINDOWS)[number]) =>
      setSettings((draft) => {
        if (!WINDOWS.includes(window as any)) {
          onError?.(
            new Error(
              `Invalid window type, must be one of ${WINDOWS.join(", ")}`,
            ),
          );
          return;
        }
        draft.window = window;
        onChange?.(draft);
      }),
    [onChange, setSettings, onError],
  );

  const setDBRange = useCallback(
    ({ min = -80, max = 0 }: { min?: number; max?: number }) =>
      setSettings((draft) => {
        if (min >= max) {
          onError?.(new Error("Minimum dB must be less than maximum dB"));
          return;
        }
        draft.min_dB = min;
        draft.max_dB = max;
        onChange?.(draft);
      }),
    [onChange, setSettings, onError],
  );

  const setColormap = useCallback(
    (colormap: (typeof COLORMAPS)[number]) =>
      setSettings((draft) => {
        if (!COLORMAPS.includes(colormap as any)) {
          onError?.(
            new Error(
              `Invalid colormap, must be one of ${COLORMAPS.join(", ")}`,
            ),
          );
          return;
        }
        draft.cmap = colormap;
        onChange?.(draft);
      }),
    [onChange, setSettings, onError],
  );

  const togglePCEN = useCallback(
    () =>
      setSettings((draft) => {
        draft.pcen = !draft.pcen;
        onChange?.(draft);
      }),
    [onChange, setSettings],
  );

  const toggleNormalize = useCallback(
    () =>
      setSettings((draft) => {
        draft.normalize = !draft.normalize;
        onChange?.(draft);
      }),
    [onChange, setSettings],
  );

  const reset = useCallback(() => {
    setSettings(() => initialSettings);
    onReset?.();
  }, [initialSettings, onReset, setSettings]);

  return {
    settings,
    setWindowSize,
    setOverlap,
    setScale,
    setWindow,
    setDBRange,
    setColormap,
    togglePCEN,
    toggleNormalize,
    reset,
  };
}
