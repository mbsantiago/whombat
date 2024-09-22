import { useCallback } from "react";
import toast from "react-hot-toast";

import useAudioSettings from "@/app/hooks/settings/useAudioSettings";
import useSpectrogramSettings from "@/app/hooks/settings/useSpectrogramSettings";

import useStore from "@/app/store";

import SettingsMenuBase from "@/lib/components/settings/SettingsMenu";

export default function SettingsMenu({
  samplerate,
  audioSettings,
  spectrogramSettings,
}: {
  samplerate: number;
  audioSettings: ReturnType<typeof useAudioSettings>;
  spectrogramSettings: ReturnType<typeof useSpectrogramSettings>;
}) {
  const saveAudioSettings = useStore((state) => state.setAudioSettings);
  const saveSpectrogramSettings = useStore(
    (state) => state.setSpectrogramSettings,
  );

  const handleSave = useCallback(() => {
    saveAudioSettings(audioSettings.settings);
    saveSpectrogramSettings(spectrogramSettings.settings);
    toast.success("Settings saved");
  }, [
    audioSettings.settings,
    spectrogramSettings.settings,
    saveAudioSettings,
    saveSpectrogramSettings,
  ]);

  const { dispatch: audioDispatch } = audioSettings;
  const { dispatch: spectrogramDispatch } = spectrogramSettings;
  const handleReset = useCallback(() => {
    spectrogramDispatch({ type: "reset" });
    audioDispatch({ type: "reset" });
    toast.success("Settings reset");
  }, [audioDispatch, spectrogramDispatch]);

  return (
    <SettingsMenuBase
      samplerate={samplerate}
      audioSettings={audioSettings.settings}
      spectrogramSettings={spectrogramSettings.settings}
      onAudioSettingsChange={(settings) =>
        audioDispatch({ type: "setAll", settings })
      }
      onSpectrogramSettingsChange={(settings) =>
        spectrogramDispatch({ type: "setAll", settings })
      }
      onSaveSettings={handleSave}
      onResetSettings={handleReset}
    />
  );
}
