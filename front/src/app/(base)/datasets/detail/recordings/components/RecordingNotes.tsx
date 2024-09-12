import RecordingNotesBase from "@/lib/components/recordings/RecordingNotes";
import useRecording from "@/app/hooks/useRecording";
import type { Recording, User } from "@/lib/types";
import Loading from "@/app/loading";
import Error from "@/app/error";

export default function RecordingNotes({
  recording,
  currentUser,
}: {
  recording: Recording;
  currentUser: User;
}) {
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
