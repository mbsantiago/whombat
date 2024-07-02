import RecordingActions from "./RecordingActions";
import RecordingHeader from "./RecordingHeader";
import RecordingMap from "./RecordingMap";
import RecordingMediaInfo from "./RecordingMediaInfo";
import RecordingNotes from "./RecordingNotes";
import RecordingTagBar from "./RecordingTagBar";

import type { Recording, SpectrogramParameters, User } from "@/lib/types";

export default function RecordingDetail({
  recording,
  currentUser,
  onDelete,
  children,
}: {
  recording: Recording;
  currentUser?: User;
  parameters?: SpectrogramParameters;
  onDelete?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 pb-4">
      <RecordingHeader recording={recording} />
      <div className="flex flex-row flex-wrap gap-8 justify-between lg:flex-nowrap w-100">
        <div className="grow">
          <div className="grid grid-cols-2 gap-8">
            <div className="col-span-2">
              <RecordingTagBar recording={recording} />
            </div>
            <div className="col-span-2">
              {children}
            </div>
            <div className="col-span-2">
              <RecordingNotes recording={recording} currentUser={currentUser} />
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-none gap-4 max-w-sm">
          <RecordingActions recording={recording} onDelete={onDelete} />
          <RecordingMediaInfo recording={recording} />
          <RecordingMap recording={recording} />
        </div>
      </div>
    </div>
  );
}
