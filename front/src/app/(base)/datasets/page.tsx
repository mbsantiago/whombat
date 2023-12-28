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

import DatasetList from "@/components/datasets/DatasetList";
import Hero from "@/components/Hero";

export default function Page() {
  return (
    <>
      <Hero text="Datasets" />
      <DatasetList />
    </>
  );
}
