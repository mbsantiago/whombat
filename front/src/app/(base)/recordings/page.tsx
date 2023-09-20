"use client";
import { useContext } from "react";
import useRecording from "@/hooks/api/useRecording";
import useActiveUser from "@/hooks/api/useActiveUser";
import RecordingContex from "./context";
import Loading from "@/app/loading";
import RecordingHeader from "./components/RecordingHeader";
import RecordingDetail from "./components/RecordingDetail";

export default function RecordingPage() {
  const { recording_id } = useContext(RecordingContex);

  const { data: user } = useActiveUser();

  const recording = useRecording({
    recording_id: recording_id,
  });

  if (recording.query.isLoading || recording.query.data == null) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col gap-4 px-8 pb-4">
      <RecordingHeader recording={recording.query.data} />
      <RecordingDetail
        recording={recording.query.data}
        onNoteCreate={recording.addNote.mutate}
        onNoteDelete={recording.removeNote.mutate}
        onNoteUpdate={(note_id, data) =>
          recording.updateNote.mutate({ note_id, data })
        }
        currentUser={user}
      />
    </div>
  );
}
