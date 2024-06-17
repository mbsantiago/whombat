import { useState, useCallback } from "react";
import { produce } from "immer";
import type { AudioSettings } from "@/types";

export type AudioSettingsInterface = {
  /** The current audio settings. */
  settings: AudioSettings;
  /** Sets the playback speed of the audio. */
  setSpeed: (speed: number) => void;
  /** Toggles audio resampling on or off. */
  toggleResample: () => void;
  /** Sets the sample rate for audio resampling. */
  setSamplerate: (samplerate: number) => void;
  /** Sets a low-pass/high-pass filter for the audio. */
  setFilter: (filter: {
    lowFreq?: number;
    highFreq?: number;
    order?: number;
  }) => void;
  /** Sets the audio channel (e.g., mono, stereo). */
  setChannel: (channel: number) => void;
  /** Resets all settings to their initial values. */
  reset: () => void;
};

/**
 * A React hook for managing and updating audio settings.
 *
 * Provides functions to modify individual settings like speed, resampling,
 * sample rate, filter parameters, and channels. Includes validation for input
 * values and triggers an optional `onError` callback for invalid inputs.
 * Allows resetting all settings to their initial values with the `reset`
 * function.
 */
export default function useAudioSettings({
  initialSettings,
  onChange,
  onReset,
  onError,
}: {
  /** The initial audio settings. */
  initialSettings: AudioSettings;
  /** An optional callback function that is triggered whenever the settings
   * change. */
  onChange?: (settings: AudioSettings) => void;
  /** An optional callback function that is called when the settings are
   * reset. */
  onReset?: () => void;
  /** An optional callback function that is called when an error occurs
   * during validation. */
  onError?: (error: Error) => void;
}): AudioSettingsInterface {
  const [settings, setSettings] = useState<AudioSettings>(initialSettings);

  const changeSettings = useCallback(
    (recipe: (draft: AudioSettings) => void) => {
      setSettings((prev) => {
        const next = produce(prev, recipe);
        onChange?.(next);
        return next;
      });
    },
    [onChange],
  );

  const setSpeed = useCallback(
    (speed: number) =>
      changeSettings((draft) => {
        if (speed <= 0) {
          onError?.(new Error("Speed must be greater than 0"));
          return;
        }
        draft.speed = speed;
      }),
    [changeSettings, onError],
  );

  const setSamplerate = useCallback(
    (samplerate: number) =>
      changeSettings((draft) => {
        if (samplerate <= 0) {
          onError?.(new Error("Sample rate must be greater than 0"));
          return;
        }
        draft.samplerate = samplerate;
      }),
    [changeSettings, onError],
  );

  const setFilter = useCallback(
    ({
      lowFreq,
      highFreq,
      order = 4,
    }: {
      lowFreq?: number;
      highFreq?: number;
      order?: number;
    }) =>
      changeSettings((draft) => {
        if (lowFreq != null) {
          if (lowFreq < 0) {
            onError?.(new Error("Low frequency must be greater than 0"));
            return;
          }

          if (
            draft.resample &&
            draft.samplerate != null &&
            lowFreq > draft.samplerate / 2
          ) {
            onError?.(
              new Error("Low frequency must be less than half the sample rate"),
            );
            return;
          }

          draft.low_freq = lowFreq;
        }

        if (highFreq != null) {
          if (highFreq < 0) {
            onError?.(new Error("High frequency must be greater than 0"));
            return;
          }

          if (
            draft.resample &&
            draft.samplerate != null &&
            highFreq > draft.samplerate / 2
          ) {
            onError?.(
              new Error(
                "High frequency must be less than half the sample rate",
              ),
            );
            return;
          }

          if (draft.low_freq != null && highFreq < draft.low_freq) {
            onError?.(
              new Error("High frequency must be greater than low frequency"),
            );
            return;
          }

          draft.high_freq = highFreq;
        }

        if (order <= 0) {
          onError?.(new Error("Filter order must be greater than 0"));
          return;
        }

        draft.filter_order = order;
      }),
    [changeSettings, onError],
  );

  const setChannel = useCallback(
    (channel: number) =>
      changeSettings((draft) => {
        if (channel < 0) {
          onError?.(new Error("Channel must be greater than 0"));
          return;
        }
        draft.channel = channel;
      }),
    [changeSettings, onError],
  );

  const reset = useCallback(() => {
    setSettings(() => {
      onReset?.();
      return initialSettings;
    });
  }, [initialSettings, onReset]);

  const toggleResample = useCallback(() => {
    changeSettings((draft) => {
      draft.resample = !draft.resample;
    });
  }, [changeSettings]);

  return {
    settings,
    setSpeed,
    setSamplerate,
    setFilter,
    setChannel,
    reset,
    toggleResample,
  };
}
