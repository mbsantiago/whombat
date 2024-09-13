"use client";
/**
 * Layout component for rendering the structure of a dataset detail page.
 *
 * This component fetches dataset information based on the provided dataset
 * UUID from the URL parameters. It displays a navigation header
 * (DatasetNavHeader) and wraps the content with the DatasetContext.Provider to
 * provide dataset-related context to its children components.
 */
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode } from "react";
import toast from "react-hot-toast";

import Loading from "@/app/loading";
import useDataset from "@/app/hooks/api/useDataset";

import DatasetContext from "./context";
import DatasetTabs from "./components/DatasetTabs";

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const params = useSearchParams();
  const uuid = params.get("dataset_uuid");

  if (!uuid) notFound();

  const dataset = useDataset({
    uuid: uuid,
    onDeleteDataset: () => {
      toast.success("Dataset deleted");
      router.push("/datasets/");
    },
    onError: (error) => {
      if (error.response?.status === 404) {
        notFound();
      }
    },
  });

  if (dataset.isLoading) {
    return <Loading />;
  }

  if (dataset.isError || dataset.data == null) {
    return notFound();
  }

  return (
    <DatasetContext.Provider value={dataset.data}>
      <DatasetTabs dataset={dataset.data} />
      <div className="py-4 px-8">{children}</div>
    </DatasetContext.Provider>
  );
}
