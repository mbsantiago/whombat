import { useQuery } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { useMemo } from "react";

import { type DatasetUpdate } from "@/api/datasets";
import { type Dataset } from "@/api/schemas";
import api from "@/app/api";
import useObject from "@/hooks/utils/useObject";

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
  onUpdate,
  onDelete,
  onError,
}: {
  uuid: string;
  dataset?: Dataset;
  enabled?: boolean;
  withState?: boolean;
  onUpdate?: (updated: Dataset) => void;
  onDelete?: (deleted: Dataset) => void;
  onError?: (error: AxiosError) => void;
}) {
  if (dataset !== undefined && dataset.uuid !== uuid) {
    throw new Error("Dataset uuid does not match");
  }

  const { query, useMutation } = useObject<Dataset>({
    uuid,
    initial: dataset,
    name: "dataset",
    enabled,
    getFn: api.datasets.get,
    onError,
  });

  const update = useMutation<DatasetUpdate>({
    mutationFn: api.datasets.update,
    onSuccess: onUpdate,
  });

  const delete_ = useMutation({
    mutationFn: api.datasets.delete,
    onSuccess: onDelete,
  });

  const state = useQuery({
    queryKey: ["dataset", uuid, "state"],
    queryFn: async () => await api.datasets.getState(uuid),
    enabled: withState,
  });

  const { data } = query;
  const downloadLinkJSON = useMemo(() => {
    if (data == null) {
      return undefined;
    }
    return api.datasets.getDownloadUrl(data, "json");
  }, [data]);

  const downloadLinkCSV = useMemo(() => {
    if (data == null) {
      return undefined;
    }
    return api.datasets.getDownloadUrl(data, "csv");
  }, [data]);

  return {
    ...query,
    update,
    delete: delete_,
    state,
    download: {
      json: downloadLinkJSON,
      csv: downloadLinkCSV,
    },
  };
}

export type DatasetContextType = ReturnType<typeof useDataset>;
