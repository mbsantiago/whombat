import api from "@/app/api";
import type { DatasetCreate } from "@/lib/api/datasets";
import DatasetCreateBase from "@/lib/components/datasets/DatasetCreate";
import type { Dataset } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useCallback } from "react";
import toast from "react-hot-toast";

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
