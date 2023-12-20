"use client";
import { notFound, useSearchParams } from "next/navigation";
import useRecording from "@/hooks/api/useRecording";
import RecordingContext from "./context";
import Loading from "@/app/loading";
import { type ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const params = useSearchParams();
  const uuid = params.get("recording_uuid");

  if (!uuid) notFound();

  const recording = useRecording({ uuid });

  if (recording.isLoading) {
    return <Loading />;
  }

  if (recording.isError || recording.data == null) {
    return notFound();
  }

  return (
    <RecordingContext.Provider value={recording.data}>
      {children}
    </RecordingContext.Provider>
  );
}
