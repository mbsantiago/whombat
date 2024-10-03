import DatasetDetailBase from "@/lib/components/datasets/DatasetDetail";

import type { Dataset } from "@/lib/types";

import DatasetActions from "./DatasetActions";
import DatasetNotesSummary from "./DatasetNotesSummary";
import DatasetOverview from "./DatasetOverview";
import DatasetTagsSummary from "./DatasetTagsSummary";
import DatasetUpdate from "./DatasetUpdate";

export default function DatasetDetail({
  dataset,
  onDeleteDataset,
}: {
  dataset: Dataset;
  onDeleteDataset?: () => void;
}) {
  return (
    <DatasetDetailBase
      DatasetActions={
        <DatasetActions dataset={dataset} onDeleteDataset={onDeleteDataset} />
      }
      DatasetNotesSummary={<DatasetNotesSummary dataset={dataset} />}
      DatasetTagsSummary={<DatasetTagsSummary dataset={dataset} />}
      DatasetUpdate={<DatasetUpdate dataset={dataset} />}
      DatasetOverview={<DatasetOverview dataset={dataset} />}
    />
  );
}
