import { useState, useCallback, type SetStateAction } from "react";
import type { AudioSettings } from "@/types";

export type AudioSettingsInterface = {
  settings: AudioSettings;
  setSpeed: (speed: number) => void;
  toggleResample: () => void;
  setSamplerate: (samplerate: number) => void;
  setFilter: (filter: {
    lowFreq?: number;
    highFreq?: number;
    order?: number;
  }) => void;
  setChannel: (channel: number) => void;
  reset: () => void;
};

export default function useAudioSettings({
  initialSettings,
  onSettingsChange,
  onReset,
}: {
  initialSettings: AudioSettings;
  onSettingsChange: (settings: AudioSettings) => void;
  onReset?: () => void;
}): AudioSettingsInterface {
  const [settings, setSettings] = useState<AudioSettings>(initialSettings);

  const changeSettings = useCallback(
    (newSettings: SetStateAction<AudioSettings>) => {
      setSettings((prev) => {
        const next =
          typeof newSettings === "function" ? newSettings(prev) : newSettings;
        onSettingsChange(next);
        return next;
      });
    },
    [onSettingsChange],
  );

  const setSpeed = useCallback(
    (speed: number) => changeSettings((prev) => ({ ...prev, speed })),
    [changeSettings],
  );

  const setSamplerate = useCallback(
    (samplerate: number) => changeSettings((prev) => ({ ...prev, samplerate })),
    [changeSettings],
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
      changeSettings((prev) => ({
        ...prev,
        low_freq: lowFreq,
        high_freq: highFreq,
        filter_order: order,
      })),
    [changeSettings],
  );

  const setChannel = useCallback(
    (channel: number) => changeSettings((prev) => ({ ...prev, channel })),
    [changeSettings],
  );

  const reset = useCallback(() => {
    setSettings(initialSettings);
    onReset?.();
  }, [initialSettings, onReset]);

  const toggleResample = useCallback(() => {
    changeSettings((prev) => ({
      ...prev,
      resample: !prev.resample,
    }));
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
