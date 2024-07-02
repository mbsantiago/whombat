"use client";
import { notFound } from "next/navigation";
import { useContext } from "react";

import DatasetRecordings from "@/lib/components/datasets/DatasetRecordings";
import NavBar from "@/app/(base)/datasets/detail/components/NavBar";

import DatasetContext from "../context";

import type { Recording } from "@/lib/types";

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
      <NavBar dataset={dataset} />
      <DatasetRecordings
        dataset={dataset}
        getRecordingLink={getRecordingLink}
      />
    </div>
  );
}
