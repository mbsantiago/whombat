"use client";
import { notFound } from "next/navigation";
import { useContext } from "react";

import DatasetDetail from "@/components/datasets/DatasetDetail";

import DatasetContext from "./context";

export default function DatasetHome() {
  const dataset = useContext(DatasetContext);

  if (dataset == null) {
    return notFound();
  }

  return <DatasetDetail dataset={dataset} />;
}
