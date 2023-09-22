"use client";
import { notFound, useSearchParams } from "next/navigation";
import { type ReactNode } from "react";

import { RecordingContext } from "@/app/contexts";

export default function Layout({ children }: { children: ReactNode }) {
  const params = useSearchParams();
  const recording_id = params.get("recording_id");
  if (!recording_id) notFound();

  return (
    <RecordingContext.Provider
      value={{
        recording_id: parseInt(recording_id),
      }}
    >
      {children}
    </RecordingContext.Provider>
  );
}
