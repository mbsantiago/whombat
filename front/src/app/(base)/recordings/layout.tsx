"use client";
import { notFound, useSearchParams } from "next/navigation";
import { type ReactNode } from "react";
import RecordingContex from "./context";

export default function Layout({ children }: { children: ReactNode }) {
  const params = useSearchParams();
  const recording_id = params.get("recording_id");
  if (!recording_id) notFound();

  return (
    <RecordingContex.Provider
      value={{
        recording_id: parseInt(recording_id),
      }}
    >
      {children}
    </RecordingContex.Provider>
  );
}
