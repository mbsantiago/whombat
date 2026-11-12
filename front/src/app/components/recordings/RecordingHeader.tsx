import Error from "@/app/error";
import useRecording from "@/app/hooks/api/useRecording";
import Loading from "@/app/loading";
import RecordingHeaderBase from "@/lib/components/recordings/RecordingHeader";
import type { Recording } from "@/lib/types";

export default function RecordingHeader({
  recording,
  onUpdateRecording,
}: {
  recording: Recording;
  onUpdateRecording?: (data: Recording) => void;
}) {
  const { data, isLoading, error, update } = useRecording({
    uuid: recording.uuid,
    recording,
    onUpdateRecording,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (data == null) {
    return <Error error={error || undefined} />;
  }

  return (
    <RecordingHeaderBase recording={data} onRecordingUpdate={update.mutate} />
  );
}
