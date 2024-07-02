import Card from "@/components/Card";
import Link from "@/components/Link";
import useDataset from "@/lib/hooks/api/useDataset";

import type { Dataset } from "@/lib/types";

export default function DatasetExport({ dataset }: { dataset: Dataset }) {
  const { download } = useDataset({
    uuid: dataset.uuid,
    dataset,
  });
  return (
    <div className="flex flex-col gap-4">
      <p className="text-stone-700 dark:text-stone-300">
        Download the metadata of the recordings in this dataset. Please choose
        the format for downloading the metadata:
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Card className="h-full">
          <Link
            href={download.csv || ""}
            className="block mt-2 text-center"
            download
            target="_blank"
          >
            Download CSV
          </Link>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Download recording metadata in CSV format. Convenient for editing in
            tabular software.
          </p>
        </Card>
        <Card className="h-full">
          <Link
            href={download.json || ""}
            className="block mt-2 text-center"
            download
            target="_blank"
          >
            Download JSON
          </Link>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Download recording metadata in JSON format. Data is structured in
            AEOF format; refer to our website for more details.
          </p>
        </Card>
      </div>
    </div>
  );
}
