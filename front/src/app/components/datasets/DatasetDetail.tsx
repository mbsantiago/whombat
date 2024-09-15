import DatasetDetailBase from "@/lib/components/datasets/DatasetDetail";
import DatasetNotesSummary from "./DatasetNotesSummary";
import DatasetTagsSummary from "./DatasetTagsSummary";
import DatasetOverview from "./DatasetOverview";
import DatasetUpdate from "./DatasetUpdate";
import DatasetActions from "./DatasetActions";
import type { Dataset } from "@/lib/types";

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
