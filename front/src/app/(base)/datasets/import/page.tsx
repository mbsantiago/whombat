"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import DatasetImport from "@/components/datasets/DatasetImport";
import Hero from "@/components/Hero";
import { Center } from "@/components/layouts";

import type { Dataset } from "@/types";

export default function Page() {
  const router = useRouter();

  const onCreate = useCallback(
    (dataset: Dataset) => {
      router.push(`/datasets/detail/?dataset_uuid=${dataset.uuid}/`);
    },
    [router],
  );
  return (
    <>
      <Hero text="Import a Dataset" />
      <Center>
        <DatasetImport onCreate={onCreate} />
      </Center>
    </>
  );
}
