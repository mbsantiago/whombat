import { useContext } from "react";
import useRecording from "@/app/hooks/useRecording";
import RecordingNotesBase from "@/lib/components/recordings/RecordingNotes";
import Loading from "@/app/loading";
import Error from "@/app/error";
import UserContext from "@/app/(base)/context";

import type { Recording } from "@/lib/types";

export default function RecordingNotes({
  recording,
}: {
  recording: Recording;
}) {
  const currentUser = useContext(UserContext);

  const { data, isLoading, isError, error, addNote, updateNote, removeNote } =
    useRecording({ uuid: recording.uuid });

  if (isLoading) {
    return <Loading />;
  }

  if (data == null || isError) {
    return <Error error={error || undefined} />;
  }

  return (
    <RecordingNotesBase
      notes={data.notes ?? []}
      currentUser={currentUser}
      onNoteCreate={addNote}
      onNoteUpdate={(note, data) => updateNote({ note, data })}
      onNoteDelete={removeNote}
    />
  );
}
