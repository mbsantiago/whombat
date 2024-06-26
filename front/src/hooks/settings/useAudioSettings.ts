import { useState, useCallback } from "react";
import { produce } from "immer";
import type { AudioSettings, Recording } from "@/types";

export type SpeedOption = {
  label: string;
  value: number;
};

const LOWEST_PLAYBACK_SAMPLERATE = 8000;
const HIGHTEST_PLAYBACK_SAMPLERATE = 96000;
const ALL_SPEED_OPTIONS: SpeedOption[] = [
  { label: "1x", value: 1 },
  { label: "1.2x", value: 1.2 },
  { label: "1.5x", value: 1.5 },
  { label: "1.75x", value: 1.75 },
  { label: "2x", value: 2 },
  { label: "3x", value: 3 },
  { label: "0.75x", value: 0.75 },
  { label: "0.5x", value: 0.5 },
  { label: "0.25x", value: 0.25 },
  { label: "0.1x", value: 0.1 },
];

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
  /** Adjusts the settings for compatibility with a recording. */
  adjustToRecording: (recording: Recording) => AudioSettings;
};

export function getSpeedOptions(samplerate: number): SpeedOption[] {
  return ALL_SPEED_OPTIONS.filter((option) => {
    const speed = option.value;
    const newSampleRate = samplerate * speed;
    return (
      newSampleRate >= LOWEST_PLAYBACK_SAMPLERATE &&
      newSampleRate <= HIGHTEST_PLAYBACK_SAMPLERATE
    );
  });
}

export function getDefaultSpeedOption(options: SpeedOption[]): SpeedOption {
  return options.find((option) => option.value === 1) || options[0];
}

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

  const adjustToRecording = useCallback(
    (recording: Recording) => {
      return produce(settings, (draft) => {
        if (draft.samplerate == null) {
          draft.samplerate = recording.samplerate;
        }

        const samplerate = draft.resample
          ? draft.samplerate
          : recording.samplerate;

        // Make sure the low frequency is less than half the sample rate
        if (draft.low_freq != null) {
          draft.low_freq = Math.min(draft.low_freq, samplerate / 2);
        }

        // Make sure the high frequency is less than half the sample rate
        if (draft.high_freq != null) {
          draft.high_freq = Math.min(draft.high_freq, samplerate / 2);
        }

        // Make sure the high frequency is greater than the low frequency
        if (draft.low_freq != null && draft.high_freq != null) {
          if (draft.low_freq > draft.high_freq) {
            draft.high_freq = draft.low_freq;
          }
        }

        // Make sure the speed is within the valid range
        const speedOptions = getSpeedOptions(samplerate);

        if (!speedOptions.some((option) => option.value === draft.speed)) {
          draft.speed = getDefaultSpeedOption(speedOptions).value;
        }
      });
    },
    [settings],
  );

  return {
    settings,
    setSpeed,
    setSamplerate,
    setFilter,
    setChannel,
    reset,
    toggleResample,
    adjustToRecording,
  };
}
