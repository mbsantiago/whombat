"use client";
import { notFound, useRouter } from "next/navigation";
import { useContext } from "react";

import DatasetDetail from "@/lib/components/datasets/DatasetDetail";

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
      onTagClick={(tag) =>
        router.push(`recordings/?dataset_uuid=${dataset.uuid}`)
      }
    />
  );
}
