"use client";
import { notFound } from "next/navigation";
import { useContext } from "react";

import UserContext from "@/app/(base)/context";
import Loading from "@/app/loading";
import RecordingDetail from "@/lib/components/recordings/RecordingDetail";
import RecordingSpectrogram from "../components/RecordingSpectrogram";

import useSettings from "@/app/hooks/useSettings";
import useRecording from "../hooks/useRecording";

export default function Page() {
  const user = useContext(UserContext);

  const settings = useSettings();
  const { recording, uuid, onDelete } = useRecording();

  if (uuid == null) {
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
      onDelete={onDelete}
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
