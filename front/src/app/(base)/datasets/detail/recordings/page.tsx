"use client";
import { useContext, useCallback } from "react";

import DatasetContext from "../context";
import DatasetRecordings from "@/components/datasets/DatasetRecordings";
import { notFound } from "next/navigation";
import { RecordingsNav } from "./components";
import "./page.css";

function getRecordingLink(recording: Recording): string {
  return `detail/?recording_uuid=${recording.uuid}`;
}

export default function Page() {
  const dataset = useContext(DatasetContext);

  if (dataset == null) {
    return notFound();
  }

  return (
    <div className="container">
      <RecordingsNav dataset={dataset} />
      <DatasetRecordings
        dataset={dataset}
        getRecordingLink={getRecordingLink}
      />
    </div>
  );
}
