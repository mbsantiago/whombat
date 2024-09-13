"use client";
import { notFound, useRouter } from "next/navigation";
import { useContext } from "react";

import DatasetDetail from "@/app/components/datasets/DatasetDetail";

import DatasetContext from "./context";

export default function Page() {
  const dataset = useContext(DatasetContext);
  const router = useRouter();

  if (dataset == null) {
    return notFound();
  }

  return (
    <DatasetDetail
      dataset={dataset}
      onClickDatasetTag={(tag) =>
        router.push(`recordings/?dataset_uuid=${dataset.uuid}`)
      }
    />
  );
}
