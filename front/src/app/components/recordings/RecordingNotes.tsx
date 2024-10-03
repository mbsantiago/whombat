import { useContext } from "react";

import useRecording from "@/app/hooks/api/useRecording";

import UserContext from "@/app/contexts/user";
import Error from "@/app/error";
import Loading from "@/app/loading";

import RecordingNotesBase from "@/lib/components/recordings/RecordingNotes";

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
      onCreateNote={addNote.mutate}
      onUpdateNote={(note, data) => updateNote.mutate({ note, data })}
      onDeleteNote={removeNote.mutate}
    />
  );
}
