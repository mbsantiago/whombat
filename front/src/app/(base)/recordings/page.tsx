"use client";
import { useContext } from "react";
import useRecording from "@/hooks/useRecording";
import useSpectrogramParameters from "@/hooks/useSpectrogramParameters";
import RecordingContex from "./context";
import Loading from "@/app/loading";
import RecordingHeader from "./components/RecordingHeader";
import RecordingDetail from "./components/RecordingDetail";

export default function RecordingPage() {
  const { recording_id } = useContext(RecordingContex);

  const recording = useRecording({
    recording_id: recording_id,
  });

  const specSettings = useSpectrogramParameters({
    recording: recording.query.data,
  });

  if (recording.query.isLoading || recording.query.data == null) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col gap-4 px-8">
      <RecordingHeader recording={recording.query.data} />
      <RecordingDetail
        recording={recording.query.data}
        spectrogramSettings={specSettings.parameters}
        onSpectrogramSettingsChange={specSettings.set}
        onSpectrogramSettingsClear={specSettings.clear}
      />
    </div>
  );
}
