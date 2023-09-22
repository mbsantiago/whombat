"use client";
import { useContext } from "react";

import useRecording from "@/hooks/api/useRecording";
import useActiveUser from "@/hooks/api/useActiveUser";
import Loading from "@/app/loading";
import RecordingDetail from "@/components/recordings/RecordingDetail";
import { RecordingContext } from "@/app/contexts";

export default function RecordingPage() {
  const { recording_id } = useContext(RecordingContext);

  const { data: user } = useActiveUser();

  const recording = useRecording({
    recording_id: recording_id,
  });

  if (recording.query.isLoading || recording.query.data == null) {
    return <Loading />;
  }

  return (
    <RecordingDetail
      recording={recording.query.data}
      onNoteCreate={recording.addNote.mutate}
      onNoteDelete={recording.removeNote.mutate}
      onNoteUpdate={(note_id, data) =>
        recording.updateNote.mutate({ note_id, data })
      }
      currentUser={user}
    />
  );
}
