import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type Dataset } from "@/api/schemas";
import { type DatasetUpdate } from "@/api/datasets";
import api from "@/app/api";

export default function useDataset({
  dataset,
  onUpdate,
  onDelete,
  onError,
  enabled = true,
}: {
  dataset: Dataset;
  onUpdate?: (updated: Dataset) => void;
  onDelete?: (deleted: Dataset) => void;
  onError?: (error: string) => void;
  enabled?: boolean;
}) {
  const client = useQueryClient();

  const query = useQuery(
    ["dataset", dataset.uuid],
    async () => await api.datasets.get(dataset.uuid),
    {
      initialData: dataset,
      staleTime: 1000 * 60 * 5,
      enabled,
    },
  );

  const update = useMutation({
    mutationFn: async (data: DatasetUpdate) => {
      return await api.datasets.update(dataset, data);
    },
    onSuccess: (data) => {
      onUpdate?.(data);
      client.setQueryData(["dataset", data.uuid], data);
    },
    onError: () => {
      onError?.("Failed to update dataset");
    },
  });

  const delete_ = useMutation({
    mutationFn: async () => {
      return await api.datasets.delete(dataset);
    },
    onSuccess: (data) => {
      client.invalidateQueries(["datasets"]);
      query.remove();
      onDelete?.(data);
    },
    onError: () => {
      onError?.("Failed to delete dataset");
    },
  });

  const downloadLink = useMemo(() => {
    return api.datasets.getDownloadUrl(dataset);
  }, [dataset]);

  return {
    ...query,
    update,
    delete: delete_,
    downloadLink,
  };
}
