/**
 * Page module for creating a new dataset.
 *
 * This page includes a hero section with the title "Create Dataset" and a form for creating a dataset
 * using the `DatasetCreate` component. Upon successful creation, it navigates to the details page of the
 * newly created dataset.
 *
 * @module pages/datasets/create
 * @see components/datasets/DatasetCreate
 */
"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import DatasetCreate from "@/components/datasets/DatasetCreate";

import Hero from "@/components/Hero";
import { Center } from "@/components/layouts";
import { type Dataset } from "@/api/schemas";

export default function CreateDataset() {
  const router = useRouter();

  const onCreate = useCallback(
    (dataset: Dataset) => {
      router.push(`/datasets/detail/?dataset_uuid=${dataset.uuid}`);
    },
    [router],
  );

  return (
    <>
      <Hero text="Create Dataset" />
      <Center>
        <DatasetCreate onCreate={onCreate} />
      </Center>
    </>
  );
}
