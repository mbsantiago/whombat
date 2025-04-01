import toast from "react-hot-toast";

import useDataset from "@/app/hooks/api/useDataset";

import DatasetUpdateBase from "@/lib/components/datasets/DatasetUpdate";

import type { Dataset } from "@/lib/types";

export default function DatasetUpdate({ dataset }: { dataset: Dataset }) {
  const { data, update } = useDataset({
    uuid: dataset.uuid,
    dataset,
  });
  return (
    <DatasetUpdateBase
      dataset={data || dataset}
      onChangeDataset={async (data) =>
        toast.promise(update.mutateAsync(data), {
          loading: "Updating...",
          success: "Dataset updated!",
          error: (err) => `Something went wrong. Error: ${err.toString()}`,
        })
      }
    />
  );
}
