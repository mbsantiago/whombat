import { type User } from "@/api/user";
import { type NoteCreate, type NoteUpdate } from "@/api/notes";
import { type Recording } from "@/api/recordings";

import RecordingSpectrogram from "./RecordingSpectrogram";
import RecordingNotes from "./RecordingNotes";
import RecordingActions from "./RecordingActions";
import RecordingMediaInfo from "./RecordingMediaInfo";
import RecordingMap from "./RecordingMap";
import RecordingTagBar from "./RecordingTagBar";
import RecordingHeader from "./RecordingHeader";

export default function RecordingDetail({
  recording,
  currentUser,
  onNoteCreate,
  onNoteUpdate,
  onNoteDelete,
}: {
  recording: Recording;
  currentUser?: User;
  onNoteCreate?: (note: NoteCreate) => void;
  onNoteUpdate?: (note_id: number, data: NoteUpdate) => void;
  onNoteDelete?: (note_id: number) => void;
}) {
  return (
    <div className="flex flex-col gap-4 px-8 pb-4">
      <RecordingHeader recording={recording} />
      <div className="w-100 flex flex-row flex-wrap lg:flex-nowrap gap-8 justify-between">
        <div className="grow">
          <div className="grid grid-cols-2 gap-8">
            <div className="col-span-2">
              <RecordingTagBar tags={recording.tags} />
            </div>
            <div className="col-span-2">
              <RecordingSpectrogram recording={recording} />
            </div>
            <div className="col-span-2">
              <RecordingNotes
                notes={recording.notes}
                onCreate={onNoteCreate}
                onUpdate={onNoteUpdate}
                onDelete={onNoteDelete}
                currentUser={currentUser}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-none max-w-sm gap-4">
          <RecordingActions />
          <RecordingMediaInfo recording={recording} />
          <RecordingMap recording={recording} />
        </div>
      </div>
    </div>
  );
}
