import RecordingDetailBase from "@/lib/components/recordings/RecordingDetail";
import RecordingMap from "@/lib/components/recordings/RecordingMap";
import RecordingMediaInfo from "@/lib/components/recordings/RecordingMediaInfo";

import { type Recording } from "@/lib/types";

import RecordingActions from "./RecordingActions";
import RecordingHeader from "./RecordingHeader";
import RecordingNotes from "./RecordingNotes";
import RecordingSpectrogram from "./RecordingSpectrogram";
import RecordingTagBar from "./RecordingTagBar";

export default function RecordingDetail({
  recording,
}: {
  recording: Recording;
}) {
  return (
    <RecordingDetailBase
      RecordingHeader={<RecordingHeader recording={recording} />}
      RecordingTagBar={<RecordingTagBar recording={recording} />}
      RecordingSpectrogram={<RecordingSpectrogram recording={recording} />}
      RecordingNotes={<RecordingNotes recording={recording} />}
      RecordingActions={<RecordingActions recording={recording} />}
      RecordingMediaInfo={<RecordingMediaInfo recording={recording} />}
      RecordingMap={<RecordingMap recording={recording} />}
    />
  );
}
