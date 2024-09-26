"use client";

import { notFound, useRouter } from "next/navigation";
import { useCallback, useContext } from "react";

import DatasetDetail from "@/app/components/datasets/DatasetDetail";

import DatasetContext from "./context";

export default function Page() {
  const router = useRouter();
  const dataset = useContext(DatasetContext);

  const handleDeleteDataset = useCallback(() => {
    router.push("/datasets");
  }, [router]);

  if (dataset == null) {
    return notFound();
  }

  return (
    <DatasetDetail dataset={dataset} onDeleteDataset={handleDeleteDataset} />
  );
}
