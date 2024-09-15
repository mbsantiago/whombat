import { useCallback } from "react";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

import api from "@/app/api";
import DatasetCreateBase from "@/lib/components/datasets/DatasetCreate";

import type { AxiosError } from "axios";
import type { Dataset } from "@/lib/types";
import type { DatasetCreate } from "@/lib/api/datasets";

export default function DatasetCreate({
  onCreateDataset,
  onError,
}: {
  onCreateDataset?: (project: Dataset) => void;
  onError?: (error: AxiosError) => void;
}) {
  const { mutateAsync } = useMutation({
    mutationFn: api.datasets.create,
    onError: onError,
    onSuccess: onCreateDataset,
  });

  const handleCreateProject = useCallback(
    async (data: DatasetCreate) => {
      toast.promise(mutateAsync(data), {
        loading:
          "Creating dataset. Scanning files and creating metadata, please wait...",
        success: "Dataset created",
        error: "Failed to create dataset",
      });
    },
    [mutateAsync],
  );

  return <DatasetCreateBase onCreateDataset={handleCreateProject} />;
}
