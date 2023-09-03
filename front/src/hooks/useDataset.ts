import { type DatasetUpdate, type Dataset } from "@/api/datasets";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/app/api";

export default function useDataset({
  dataset_id,
  onUpdate,
  onDelete,
}: {
  dataset_id: number;
  onUpdate?: (updated: Dataset) => void;
  onDelete?: (deleted: Dataset) => void;
}) {
  const query = useQuery(["dataset", dataset_id], () =>
    api.datasets.get(dataset_id),
  );

  const update = useMutation({
    mutationFn: async (data: DatasetUpdate) => {
      const updated = await api.datasets.update(dataset_id, data);
      onUpdate?.(updated);
      query.refetch();
      return updated;
    },
  });

  const delete_ = useMutation({
    mutationFn: async () => {
      const deleted = await api.datasets.delete(dataset_id);
      onDelete?.(deleted);
      query.refetch();
      return deleted;
    },
  });

  return {
    query,
    update,
    delete: delete_,
  };
}
