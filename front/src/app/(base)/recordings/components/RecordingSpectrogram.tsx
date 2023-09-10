import Card from "@/components/Card";
import SpectrogramCanvas from "@/components/SpectrogramCanvas";
import SpectrogramSettings from "@/components/SpectrogramSettings";
import { type Recording } from "@/api/recordings";
import { type SpectrogramParameters } from "@/api/spectrograms";

export default function RecordingSpectrogram({
  recording,
  settings,
  onSettingsChange,
  onSettingsClear,
}: {
  recording: Recording;
  settings: SpectrogramParameters;
  onSettingsChange: (key: keyof SpectrogramParameters, value: any) => void;
  onSettingsClear: (key: keyof SpectrogramParameters) => void;
}) {
  const bounds = {
    time: { min: 0, max: recording.duration },
    freq: { min: 0, max: recording.samplerate / 2 },
  };

  return (
    <Card>
      <SpectrogramSettings
        settings={settings}
        onChange={onSettingsChange}
        onClear={onSettingsClear}
      />
      <SpectrogramCanvas
        className="w-full h-96"
        recording={recording.id}
        parameters={settings}
        window={bounds}
        bounds={bounds}
      />
    </Card>
  );
}
