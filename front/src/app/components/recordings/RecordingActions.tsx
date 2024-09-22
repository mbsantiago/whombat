import useRecording from "@/app/hooks/api/useRecording";

import Error from "@/app/error";
import Loading from "@/app/loading";

import RecordingActionsBase from "@/lib/components/recordings/RecordingActions";

import type { Recording } from "@/lib/types";

export default function RecordingActions({
  recording,
  onDeleteRecording,
}: {
  recording: Recording;
  onDeleteRecording?: (recording: Recording) => void;
}) {
  const {
    data,
    isLoading,
    error,
    delete: deleteRecording,
    download,
  } = useRecording({
    uuid: recording.uuid,
    recording,
    onDeleteRecording,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (data == null) {
    return <Error error={error || undefined} />;
  }

  return (
    <RecordingActionsBase
      onDeleteRecording={deleteRecording.mutate}
      onDownloadRecording={download}
    />
  );
}
