import RecordingSpectrogram from "./RecordingSpectrogram";
import RecordingSoundEventsSummary from "./RecordingUsageSummary";
import RecordingUsageSummary from "./RecordingUsageSummary";
import RecordingActions from "./RecordingActions";
import RecordingMediaInfo from "./RecordingMediaInfo";
import RecordingMap from "./RecordingMap";
import RecordingTagBar from "./RecordingTagBar";
import { type Recording } from "@/api/recordings";
import { type SpectrogramParameters } from "@/api/spectrograms";

export default function RecordingDetail({
  spectrogramSettings,
  onSpectrogramSettingsChange,
  onSpectrogramSettingsClear,
  recording,
}: {
  spectrogramSettings: SpectrogramParameters;
  onSpectrogramSettingsChange: (
    key: keyof SpectrogramParameters,
    value: any,
  ) => void;
  onSpectrogramSettingsClear: (key: keyof SpectrogramParameters) => void;
  recording: Recording;
}) {
  return (
    <div className="w-100 flex flex-row flex-wrap lg:flex-nowrap gap-8 justify-between">
      <div className="grow">
        <div className="grid grid-cols-2 gap-8">
          <div className="col-span-2">
            <RecordingTagBar recording={recording} />
          </div>
          <div className="col-span-2">
            <RecordingSpectrogram
              settings={spectrogramSettings}
              onSettingsChange={onSpectrogramSettingsChange}
              onSettingsClear={onSpectrogramSettingsClear}
              recording={recording}
            />
          </div>
          <div className="col-span-2 xl:col-span-1">
            <RecordingSoundEventsSummary />
          </div>
          <div className="col-span-2 xl:col-span-1">
            <RecordingUsageSummary />
          </div>
        </div>
      </div>
      <div className="flex flex-col flex-none max-w-sm gap-4">
        <RecordingActions />
        <RecordingMediaInfo recording={recording} />
        <RecordingMap recording={recording} />
      </div>
    </div>
  );
}
