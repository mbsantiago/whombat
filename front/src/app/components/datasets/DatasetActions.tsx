import toast from "react-hot-toast";

import useDataset from "@/app/hooks/api/useDataset";

import DatasetActionsBase from "@/lib/components/datasets/DatasetActions";

import type { Dataset } from "@/lib/types";

export default function DatasetActions({
  dataset,
  onDeleteDataset,
}: {
  dataset: Dataset;
  onDeleteDataset?: () => void;
}) {
  const { delete: deleteDataset, download } = useDataset({
    uuid: dataset.uuid,
    dataset,
    onDeleteDataset,
  });
  return (
    <DatasetActionsBase
      dataset={dataset}
      onDeleteDataset={async () =>
        toast.promise(
          deleteDataset.mutateAsync(dataset),
          {
            loading: "Deleting...",
            success: "Dataset deleted successfuly!",
            error: (err) =>
              `Could not delete dataset.\n\nError: ${err.response.data.message}`,
          },
          {
            id: "delete-dataset",
            error: {
              duration: 10000,
            },
          },
        )
      }
      onDownloadDataset={async () =>
        await toast.promise(download("json"), {
          loading: "Downloading...",
          success: "Download complete",
          error: "Failed to download dataset",
        })
      }
    />
  );
}
