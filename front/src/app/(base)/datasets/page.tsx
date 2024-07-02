"use client";
/**
 * Page module for displaying the list of datasets.
 *
 * This page includes a hero section with the title "Datasets" and a list of
 * datasets using the `DatasetList` component.
 *
 * @module pages/datasets
 * @see components/datasets/DatasetList
 */
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import toast from "react-hot-toast";

import DatasetList from "@/components/datasets/DatasetList";
import Hero from "@/components/Hero";

import type { Dataset } from "@/lib/types";

export default function Page() {
  const router = useRouter();

  const handleCreate = useCallback(
    (dataset: Promise<Dataset>) => {
      toast.promise(dataset, {
        loading: "Creating dataset. Please wait as this may take a while...",
        success: "Dataset created.",
        error: "Failed to create dataset.",
      });

      dataset.then((data) => {
        router.push(`/datasets/detail/?dataset_uuid=${data.uuid}`);
      });
    },
    [router],
  );

  return (
    <>
      <Hero text="Datasets" />
      <DatasetList onCreate={handleCreate} />
    </>
  );
}
