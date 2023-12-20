import { type Recording, type User } from "@/api/schemas";

import RecordingSpectrogram from "./RecordingSpectrogram";
import RecordingNotes from "./RecordingNotes";
import RecordingActions from "./RecordingActions";
import RecordingMediaInfo from "./RecordingMediaInfo";
import RecordingMap from "./RecordingMap";
import RecordingTagBar from "./RecordingTagBar";
import RecordingHeader from "./RecordingHeader";
import RecordingPlayer from "./RecordingPlayer";

export default function RecordingDetail({
  recording,
  currentUser,
}: {
  recording: Recording;
  currentUser?: User;
}) {
  return (
    <div className="flex flex-col gap-4 px-8 pb-4">
      <RecordingHeader recording={recording} />
      <div className="flex flex-row flex-wrap gap-8 justify-between lg:flex-nowrap w-100">
        <div className="grow">
          <div className="grid grid-cols-2 gap-8">
            <div className="col-span-2">
              <RecordingTagBar recording={recording} />
            </div>
            <RecordingPlayer recording={recording} />
            {/* <div className="col-span-2"> */}
            {/*   <RecordingSpectrogram recording={recording} /> */}
            {/* </div> */}
            <div className="col-span-2">
              <RecordingNotes recording={recording} currentUser={currentUser} />
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-none gap-4 max-w-sm">
          <RecordingActions />
          <RecordingMediaInfo recording={recording} />
          <RecordingMap recording={recording} />
        </div>
      </div>
    </div>
  );
}
