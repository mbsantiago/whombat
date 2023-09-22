"use client";
import { useContext } from "react";
import { notFound } from "next/navigation";

import DatasetDetail from "@/components/datasets/DatasetDetail";
import { DatasetContext } from "@/app/contexts";

export default function DatasetHome() {
  const { dataset, onChange, downloadLink } = useContext(DatasetContext);

  if (dataset == null) return notFound();

  return (
    <DatasetDetail dataset={dataset} onChange={onChange} downloadLink={downloadLink} />
  );
}
