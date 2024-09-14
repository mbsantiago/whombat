import useDataset from "@/app/hooks/api/useDataset";
import DatasetRecordingsSummaryBase from "@/lib/components/datasets/DatasetRecordingsSummary";
import type { Dataset } from "@/lib/types";

export default function DatasetRecordingsSummary({
  dataset,
}: {
  dataset: Dataset;
}) {
  const { data, download } = useDataset({
    uuid: dataset.uuid,
    dataset,
  });
  return <DatasetRecordingsSummaryBase dataset={data || dataset} onDownloadDataset={download} />;
}
