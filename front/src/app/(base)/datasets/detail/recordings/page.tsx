"use client";
import { notFound } from "next/navigation";
import { useContext } from "react";

import DatasetRecordings from "@/app/(base)/datasets/detail/components/DatasetRecordings";
import NavBar from "@/app/(base)/datasets/detail/components/NavBar";

import DatasetContext from "../context";

import "./page.css";

export default function Page() {
  const dataset = useContext(DatasetContext);

  if (dataset == null) {
    return notFound();
  }

  return (
    <div className="w-full">
      <NavBar dataset={dataset} />
      <DatasetRecordings dataset={dataset} />
    </div>
  );
}
