import { useCallback } from "react";
import toast from "react-hot-toast";

import useStore from "@/app/store";

import useAudioSettings from "@/lib/hooks/settings/useAudioSettings";
import useSpectrogramSettings from "@/lib/hooks/settings/useSpectrogramSettings";

export default function useSettings() {
  const initialAudioSettings = useStore((state) => state.audioSettings);
  const initialSpectrogramSettings = useStore(
    (state) => state.spectrogramSettings,
  );

  const saveAudioSettings = useStore((state) => state.setAudioSettings);
  const saveSpectrogramSettings = useStore(
    (state) => state.setSpectrogramSettings,
  );

  const { settings: audioSettings, dispatch: dispatchAudioSettingsAction } =
    useAudioSettings({
      initialSettings: initialAudioSettings,
    });

  const {
    settings: spectrogramSettings,
    dispatch: dispatchSpectrogramSettingsAction,
  } = useSpectrogramSettings({
    initialSettings: initialSpectrogramSettings,
  });

  const save = useCallback(() => {
    saveAudioSettings(audioSettings);
    saveSpectrogramSettings(spectrogramSettings);
    toast.success("Settings saved");
  }, [
    audioSettings,
    spectrogramSettings,
    saveAudioSettings,
    saveSpectrogramSettings,
  ]);

  const reset = useCallback(() => {
    dispatchAudioSettingsAction({ type: "reset" });
    dispatchSpectrogramSettingsAction({ type: "reset" });
    toast.success("Settings reset");
  }, [dispatchAudioSettingsAction, dispatchSpectrogramSettingsAction]);

  return {
    audioSettings,
    spectrogramSettings,
    dispatchAudioSettingsAction,
    dispatchSpectrogramSettingsAction,
    save,
    reset,
  };
}
