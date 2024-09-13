import RecordingDetailBase from "@/lib/components/recordings/RecordingDetail";
import { type Recording } from "@/lib/types";

import RecordingHeader from "./RecordingHeader";
import RecordingTagBar from "./RecordingTagBar";
import RecordingNotes from "./RecordingNotes";
import RecordingActions from "./RecordingActions";
import RecordingSpectrogram from "./RecordingSpectrogram";
import RecordingMediaInfo from "@/lib/components/recordings/RecordingMediaInfo";
import RecordingMap from "@/lib/components/recordings/RecordingMap";

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
