"use client";
import { notFound } from "next/navigation";
import { useContext } from "react";

import DatasetRecordings from "@/components/datasets/DatasetRecordings";
import { DatasetRecordingsNav } from "@/components/datasets/DatasetRecordingsNav";

import DatasetContext from "../context";

import type { Recording } from "@/types";

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
    <div className="w-full">
      <DatasetRecordingsNav dataset={dataset} />
      <DatasetRecordings
        dataset={dataset}
        getRecordingLink={getRecordingLink}
      />
    </div>
  );
}
