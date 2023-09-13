import { useCallback, useMemo } from "react";
import { type DatasetUpdate, type Dataset } from "@/api/datasets";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/app/api";

export default function useDataset({
  dataset_id,
  onUpdate,
  onDelete,
  onError,
}: {
  dataset_id?: number;
  onUpdate?: (updated: Dataset) => void;
  onDelete?: (deleted: Dataset) => void;
  onError?: (error: string) => void;
}) {
  const queryFn = useCallback(async () => {
    if (dataset_id == null) return;
    return await api.datasets.get(dataset_id);
  }, [dataset_id]);

  const updateFn = useCallback(
    async (data: DatasetUpdate) => {
      if (dataset_id == null) return;
      return await api.datasets.update(dataset_id, data);
    },
    [dataset_id],
  );

  const deleteFn = useCallback(async () => {
    if (dataset_id == null) return;
    return await api.datasets.delete(dataset_id);
  }, [dataset_id]);

  const query = useQuery(["dataset", dataset_id], queryFn, {
    enabled: dataset_id != null,
  });

  const update = useMutation({
    mutationFn: updateFn,
    onSuccess: (data) => {
      query.refetch();
      if (data != null) {
        onUpdate?.(data);
      }
    },
    onError: () => {
      onError?.("Failed to update dataset");
    }
  });

  const delete_ = useMutation({
    mutationFn: deleteFn,
    onSuccess: (data) => {
      query.remove();
      if (data != null) {
        onDelete?.(data);
      }
    },
    onError: () => {
      onError?.("Failed to delete dataset");
    }
  });

  const downloadLink = useMemo(() => {
    if (dataset_id == null) return;
    return api.datasets.getDownloadUrl(dataset_id);
  }, [dataset_id]);

  return {
    query,
    update,
    delete: delete_,
    downloadLink,
  };
}
