import { useCallback } from "react";
import useStore from "@/app/store";
import toast from "react-hot-toast";

import useSpectrogramSettings from "@/lib/hooks/settings/useSpectrogramSettings";
import useAudioSettings from "@/lib/hooks/settings/useAudioSettings";

export default function useSettings() {
  const initialAudioSettings = useStore((state) => state.audioSettings);
  const initialSpectrogramSettings = useStore(
    (state) => state.spectrogramSettings,
  );

  const saveAudioSettings = useStore((state) => state.setAudioSettings);
  const saveSpectrogramSettings = useStore(
    (state) => state.setSpectrogramSettings,
  );

  const audioSettings = useAudioSettings({
    initialSettings: initialAudioSettings,
  });

  const spectrogramSettings = useSpectrogramSettings({
    initialSettings: initialSpectrogramSettings,
  });

  const { settings: currentAudioSettings, set: setAudioSettings } =
    audioSettings;
  const { settings: currentSpectrogramSettings, set: setSpectrogramSettings } =
    spectrogramSettings;

  const save = useCallback(() => {
    saveAudioSettings(currentAudioSettings);
    saveSpectrogramSettings(currentSpectrogramSettings);
    toast.success("Settings saved");
  }, [
    currentAudioSettings,
    currentSpectrogramSettings,
    saveAudioSettings,
    saveSpectrogramSettings,
  ]);

  const reset = useCallback(() => {
    setAudioSettings(initialAudioSettings);
    setSpectrogramSettings(initialSpectrogramSettings);
    toast.success("Settings reset");
  }, [
    initialAudioSettings,
    initialSpectrogramSettings,
    setAudioSettings,
    setSpectrogramSettings,
  ]);

  return {
    audioSettings,
    spectrogramSettings,
    save,
    reset,
  };
}
