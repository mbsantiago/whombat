import DatasetDetailBase from "@/lib/components/datasets/DatasetDetail";
import DatasetNotesSummary from "./DatasetNotesSummary";
import DatasetTagsSummary from "./DatasetTagsSummary";
import DatasetOverview from "./DatasetOverview";
import DatasetUpdate from "./DatasetUpdate";
import type { Dataset } from "@/lib/types";

export default function DatasetDetail({ dataset }: { dataset: Dataset }) {
  return (
    <DatasetDetailBase
      DatasetNotesSummary={<DatasetNotesSummary dataset={dataset} />}
      DatasetTagsSummary={<DatasetTagsSummary dataset={dataset} />}
      DatasetUpdate={<DatasetUpdate dataset={dataset} />}
      DatasetOverview={<DatasetOverview dataset={dataset} />}
    />
  );
}
