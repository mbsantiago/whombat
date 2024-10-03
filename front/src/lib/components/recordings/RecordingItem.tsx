import { FC } from "react";

import RecordingHeader from "@/lib/components/recordings/RecordingHeader";
import RecordingTagBar from "@/lib/components/recordings/RecordingTagBar";

import type { Recording, SpectrogramProps } from "@/lib/types";

export default function RecordingItem(
  props: {
    recording: Recording;
    SpectrogramRecording: FC<{ recording: Recording } & SpectrogramProps>;
  } & SpectrogramProps,
) {
  const { recording, SpectrogramRecording, ...rest } = props;
  return (
    <div className="flex flex-col gap-2">
      <RecordingHeader disabled={true} recording={recording} />
      <RecordingTagBar tags={recording.tags} disabled />
      <div>{<SpectrogramRecording recording={recording} {...rest} />}</div>
    </div>
  );
}
