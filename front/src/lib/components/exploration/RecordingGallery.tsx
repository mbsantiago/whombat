import { FC } from "react";

import RecordingItem from "@/lib/components/recordings/RecordingItem";

import type { Recording, SpectrogramProps } from "@/lib/types";

export default function RecordingsGallery(
  props: {
    recordings: Recording[];
    RecordingSpectrogram: FC<{ recording: Recording } & SpectrogramProps>;
  } & SpectrogramProps,
) {
  const { recordings, RecordingSpectrogram, ...rest } = props;
  return (
    <div className="flex flex-col gap-2 px-4">
      <div className="flex flex-col gap-8">
        {recordings.map((recording) => (
          <RecordingItem
            key={recording.uuid}
            recording={recording}
            SpectrogramRecording={RecordingSpectrogram}
            {...rest}
          />
        ))}
      </div>
    </div>
  );
}
