"use client";
import { useContext } from "react";
import { notFound } from "next/navigation";

import DatasetDetail from "../components/DatasetDetail";

import { DatasetContext } from "./context";

export default function DatasetHome() {
  const { dataset, onChange, downloadLink } = useContext(DatasetContext);

  if (dataset == null) return notFound();

  return (
    <DatasetDetail dataset={dataset} onChange={onChange} downloadLink={downloadLink} />
  );
}
