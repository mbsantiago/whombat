import { useState } from "react";

import { H3 } from "@/lib/components/ui/Headings";
import SpectrogramSettingsComponent from "@/lib/components/settings/SpectrogramSettings";
import AudioSettingsComponent from "@/lib/components/settings/AudioSettings";
import Button from "@/lib/components/ui/Button";
import SlideOver from "@/lib/components/ui/SlideOver";
import Tooltip from "@/lib/components/ui/Tooltip";
import { SettingsIcon } from "@/lib/components/icons";

import type { SpectrogramSettings, AudioSettings } from "@/lib/types";

export default function SettingsMenu({
  audioSettings,
  spectrogramSettings,
  samplerate,
  onAudioSettingsChange,
  onSpectrogramSettingsChange,
  onResetClick,
  onSaveClick,
}: {
  audioSettings: AudioSettings;
  spectrogramSettings: SpectrogramSettings;
  samplerate: number;
  onAudioSettingsChange?: (settings: AudioSettings) => void;
  onSpectrogramSettingsChange?: (settings: SpectrogramSettings) => void;
  onResetClick?: () => void;
  onSaveClick?: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Tooltip placement="bottom" tooltip="Spectrogram settings">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          <SettingsIcon className="w-5 h-5" />
        </Button>
      </Tooltip>
      <SlideOver
        title={
          <div className="flex flex-row justify-between items-center">
            <span className="inline-flex items-center">
              <SettingsIcon className="inline-block mr-2 w-6 h-6" />
              Settings
            </span>
            <span className="inline-flex gap-4 items-center">
              <Button mode="text" variant="warning" onClick={onResetClick}>
                Reset
              </Button>
              <Button mode="text" variant="primary" onClick={onSaveClick}>
                Save
              </Button>
            </span>
          </div>
        }
        isOpen={open}
        onClose={() => setOpen(false)}
      >
        <div className="flex flex-col gap-4">
          <H3>Audio</H3>
          <AudioSettingsComponent
            samplerate={samplerate}
            settings={audioSettings}
            onChange={onAudioSettingsChange}
          />
          <H3>Spectrogram</H3>
          <SpectrogramSettingsComponent
            samplerate={samplerate}
            settings={spectrogramSettings}
            onChange={onSpectrogramSettingsChange}
          />
        </div>
      </SlideOver>
    </div>
  );
}
