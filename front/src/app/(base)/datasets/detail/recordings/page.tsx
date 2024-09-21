"use client";

import DatasetRecordings from "@/app/components/datasets/DatasetRecordings";
import DatasetRecordingSummary from "@/app/components/datasets/DatasetRecordingsSummary";
import { notFound } from "next/navigation";
import { useContext } from "react";

import DatasetContext from "../context";

export default function Page() {
  const dataset = useContext(DatasetContext);

  if (dataset == null) {
    return notFound();
  }

  return (
    <div className="w-full">
      <DatasetRecordingSummary dataset={dataset} />
      <DatasetRecordings dataset={dataset} />
    </div>
  );
}
