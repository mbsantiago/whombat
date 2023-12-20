"use client";
import { useContext } from "react";
import { notFound } from "next/navigation";

import RecordingDetail from "@/components/recordings/RecordingDetail";
import RecordingContext from "./context";
import UserContext from "../context";

export default function Page() {
  const recording = useContext(RecordingContext);
  const user = useContext(UserContext);

  if (recording == null || user == null) {
    return notFound();
  }

  return <RecordingDetail recording={recording} currentUser={user} />;
}
