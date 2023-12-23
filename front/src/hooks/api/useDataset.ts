import { type AxiosError } from "axios";
import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { type Dataset } from "@/api/schemas";
import { type DatasetUpdate } from "@/api/datasets";
import useObject from "@/hooks/utils/useObject";
import api from "@/app/api";

/**
 * Custom hook for managing dataset-related state, fetching, and mutations.
 *
 * This hook encapsulates the logic for querying, updating, and deleting
 * dataset information using React Query. It can also fetch and provide
 * additional dataset state if enabled.
 *
 * @param {Object} props - The hook parameters.
 * @param {string} props.uuid - The UUID of the dataset to be managed.
 * @param {Dataset} [props.dataset] - Optional initial dataset data to provide
 * or override.
 * @param {(updated: Dataset) => void} [props.onUpdate] - Callback function
 * invoked on successful dataset update.
 * @param {(deleted: Dataset) => void} [props.onDelete] - Callback function
 * invoked on successful dataset deletion.
 * @param {boolean} [props.enabled=true] - Whether the dataset-related queries
 * and mutations are enabled.
 * @param {boolean} [props.withState=false] - Whether to fetch and provide
 * additional dataset state.
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
  const downloadLink = useMemo(() => {
    if (data == null) {
      return undefined;
    }
    return api.datasets.getDownloadUrl(data);
  }, [data]);

  return {
    ...query,
    update,
    delete: delete_,
    state,
    downloadLink,
  };
}

export type DatasetContextType = ReturnType<typeof useDataset>;
