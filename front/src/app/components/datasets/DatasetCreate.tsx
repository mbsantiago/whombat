import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useCallback } from "react";
import toast from "react-hot-toast";

import api from "@/app/api";
import DatasetCreateBase from "@/lib/components/datasets/DatasetCreate";
import type { Dataset, DatasetCreate } from "@/lib/types";

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
    onSuccess: (result) => onCreateDataset?.(result.dataset),
  });

  const handleCreateProject = useCallback(
    async (data: DatasetCreate) => {
      toast.promise(mutateAsync(data), {
        loading:
          "Creating dataset. Scanning files and creating metadata, please wait...",
        success: (result) => {
          const parts = [`${result.recordings_attached} files`];
          if (result.already_known) {
            parts.push(`${result.already_known} already known`);
          }
          if (result.duplicates_in_selection) {
            parts.push(`${result.duplicates_in_selection} duplicates`);
          }
          if (result.unreadable) {
            parts.push(`${result.unreadable} unreadable`);
          }
          return `Dataset created: ${parts.join(", ")}`;
        },
        error: "Failed to create dataset",
      });
    },
    [mutateAsync],
  );

  return (
    <DatasetCreateBase
      onCreateDataset={handleCreateProject}
      browseDirectories={api.datasets.browse}
      completeDirectories={api.datasets.complete}
    />
  );
}
