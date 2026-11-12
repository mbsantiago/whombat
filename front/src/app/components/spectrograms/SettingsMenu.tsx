import { useCallback } from "react";
import toast from "react-hot-toast";

import useAudioSettings from "@/app/hooks/settings/useAudioSettings";
import useSpectrogramSettings from "@/app/hooks/settings/useSpectrogramSettings";
import useViewSettings from "@/app/hooks/settings/useViewSettings";
import useStore from "@/app/store";
import SettingsMenuBase from "@/lib/components/settings/SettingsMenu";

export default function SettingsMenu({
  samplerate,
  audioSettings,
  spectrogramSettings,
  viewSettings,
}: {
  samplerate: number;
  audioSettings: ReturnType<typeof useAudioSettings>;
  spectrogramSettings: ReturnType<typeof useSpectrogramSettings>;
  viewSettings: ReturnType<typeof useViewSettings>;
}) {
  const saveAudioSettings = useStore((state) => state.setAudioSettings);
  const saveSpectrogramSettings = useStore(
    (state) => state.setSpectrogramSettings,
  );
  const saveViewSettings = useStore((state) => state.setViewSettings);

  const handleSave = useCallback(() => {
    saveAudioSettings(audioSettings.settings);
    saveSpectrogramSettings(spectrogramSettings.settings);
    saveViewSettings(viewSettings.settings);
    toast.success("Settings saved");
  }, [
    audioSettings.settings,
    spectrogramSettings.settings,
    viewSettings.settings,
    saveAudioSettings,
    saveSpectrogramSettings,
    saveViewSettings,
  ]);

  const { dispatch: audioDispatch } = audioSettings;
  const { dispatch: spectrogramDispatch } = spectrogramSettings;
  const { dispatch: viewDispatch } = viewSettings;

  const handleReset = useCallback(() => {
    spectrogramDispatch({ type: "reset" });
    audioDispatch({ type: "reset" });
    viewDispatch({ type: "reset" });
    toast.success("Settings reset");
  }, [audioDispatch, spectrogramDispatch, viewDispatch]);

  return (
    <SettingsMenuBase
      samplerate={samplerate}
      audioSettings={audioSettings.settings}
      spectrogramSettings={spectrogramSettings.settings}
      viewSettings={viewSettings.settings}
      onAudioSettingsChange={(settings) =>
        audioDispatch({ type: "setAll", settings })
      }
      onSpectrogramSettingsChange={(settings) =>
        spectrogramDispatch({ type: "setAll", settings })
      }
      onViewSettingsChange={(settings) =>
        viewDispatch({ type: "setAll", settings })
      }
      onSaveSettings={handleSave}
      onResetSettings={handleReset}
    />
  );
}
