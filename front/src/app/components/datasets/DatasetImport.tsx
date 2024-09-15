import { useCallback } from "react";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

import api from "@/app/api";
import DatasetImportBase from "@/lib/components/datasets/DatasetImport";

import type { AxiosError } from "axios";
import type { Dataset } from "@/lib/types";
import type { DatasetImport } from "@/lib/api/datasets";

export default function DatasetImport({
  onImportDataset,
  onError,
}: {
  onImportDataset?: (project: Dataset) => void;
  onError?: (error: AxiosError) => void;
}) {
  const { mutateAsync } = useMutation({
    mutationFn: api.datasets.import,
    onError: onError,
    onSuccess: onImportDataset,
  });

  const handleImportProject = useCallback(
    async (data: DatasetImport) => {
      toast.promise(mutateAsync(data), {
        loading: "Importing dataset...",
        success: "Dataset imported",
        error: "Failed to import dataset",
      });
    },
    [mutateAsync],
  );

  return <DatasetImportBase onImportDataset={handleImportProject} />;
}
