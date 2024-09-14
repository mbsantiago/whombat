import toast from "react-hot-toast";
import { useCallback } from "react";
import SettingsMenuBase from "@/lib/components/settings/SettingsMenu";
import useStore from "@/app/store";
import useAudioSettings from "@/app/hooks/settings/useAudioSettings";
import useSpectrogramSettings from "@/app/hooks/settings/useSpectrogramSettings";
import type { Recording } from "@/lib/types";

export default function SettingsMenu({
  recording,
  audioSettings,
  spectrogramSettings,
}: {
  recording: Recording;
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
    toast.success("Settings saved")
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
    toast.success("Settings reset")
  }, [audioDispatch, spectrogramDispatch]);

  return (
    <SettingsMenuBase
      samplerate={recording.samplerate}
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
