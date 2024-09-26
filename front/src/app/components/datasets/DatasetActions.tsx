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
      onDeleteDataset={() => deleteDataset.mutate(dataset)}
      onDownloadDataset={() => download("json")}
    />
  );
}
