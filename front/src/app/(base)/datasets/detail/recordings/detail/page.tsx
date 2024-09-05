"use client";
import { useSearchParams, notFound } from "next/navigation";
import { useHotkeysContext } from "react-hotkeys-hook";
import { useContext } from "react";
import toast from "react-hot-toast";

import UserContext from "@/app/(base)/context";
import Loading from "@/app/loading";
import RecordingDetail from "@/lib/components/recordings/RecordingDetail";
import RecordingSpectrogram from "../components/RecordingSpectrogram";

import useSettings from "@/app/hooks/useSettings";
import useRecording from "@/app/hooks/useRecording";

export default function Page() {
  const user = useContext(UserContext);
  const searchParams = useSearchParams();
  const recordingUUID = searchParams.get("recording_uuid") ?? "recording_uuid";

  const settings = useSettings();
  const recording = useRecording({ uuid: recordingUUID });
  const { hotkeys } = useHotkeysContext();

  if (recordingUUID == null) {
    notFound();
  }

  if (recording.isLoading) {
    return <Loading />;
  }

  if (recording.isError || recording.data == null) {
    // @ts-ignore
    return handleError(recording.error);
  }

  return (
    <RecordingDetail
      recording={recording.data}
      currentUser={user}
      onRecordingClick={() => {
        if (recording.data == null) return;
        navigator.clipboard.writeText(recording.data.path);
        toast.success("Copied full path to clipboard");
      }}
      onDelete={recording.deleteRecording}
      onRecordingUpdate={recording.updateRecording}
      onTagAdd={recording.addTag}
      onTagRemove={recording.removeTag}
      onNoteCreate={recording.addNote}
      onNoteUpdate={(note, data) => recording.updateNote({ note, data })}
      onNoteDelete={recording.removeNote}
      downloadUrl={recording.downloadUrl}
    >
      <RecordingSpectrogram
        recording={recording.data}
        audioSettings={settings.audioSettings}
        spectrogramSettings={settings.spectrogramSettings}
        onReset={settings.reset}
        onSave={settings.save}
      />
    </RecordingDetail>
  );
}
