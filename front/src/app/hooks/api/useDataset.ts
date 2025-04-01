import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useCallback } from "react";

import api from "@/app/api";

import useObject from "@/lib/hooks/utils/useObject";

import type { Dataset, DatasetUpdate } from "@/lib/types";

/**
 * Custom hook for managing dataset-related state, fetching, and mutations.
 *
 * This hook encapsulates the logic for querying, updating, and deleting
 * dataset information using React Query. It can also fetch and provide
 * additional dataset state if enabled.
 */
export default function useDataset({
  uuid,
  dataset,
  enabled = true,
  withState = false,
  onUpdateDataset,
  onDeleteDataset,
  onError,
}: {
  uuid: string;
  dataset?: Dataset;
  enabled?: boolean;
  withState?: boolean;
  onUpdateDataset?: (updated: Dataset) => void;
  onDeleteDataset?: (deleted: Dataset) => void;
  onError?: (error: AxiosError) => void;
}) {
  if (dataset !== undefined && dataset.uuid !== uuid) {
    throw new Error("Dataset uuid does not match");
  }

  const { query, useMutation } = useObject<Dataset>({
    id: uuid,
    initialData: dataset,
    name: "dataset",
    enabled,
    queryFn: api.datasets.get,
    onError,
  });

  const update = useMutation<DatasetUpdate>({
    mutationFn: api.datasets.update,
    onSuccess: (data) => {
      onUpdateDataset?.(data);
    },
  });

  const delete_ = useMutation({
    mutationFn: api.datasets.delete,
    onSuccess: (data) => {
      onDeleteDataset?.(data);
    },
  });

  const state = useQuery({
    queryKey: ["dataset", uuid, "state"],
    queryFn: async () => await api.datasets.getState(uuid),
    enabled: withState,
  });

  const download = useCallback(
    async (format: "csv" | "json") => {
      return await api.datasets.download(uuid, format);
    },
    [uuid],
  );

  return {
    ...query,
    update,
    delete: delete_,
    state,
    download,
  };
}
