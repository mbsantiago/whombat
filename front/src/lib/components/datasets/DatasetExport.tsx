import Card from "@/lib/components/ui/Card";
import Button from "@/lib/components/ui/Button";

type DatasetExportFormat = "csv" | "json";

export default function DatasetExport({
  onDownloadDataset,
}: {
  onDownloadDataset?: (format: DatasetExportFormat) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-stone-700 dark:text-stone-300">
        Download the metadata of the recordings in this dataset. Please choose
        the format for downloading the metadata:
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Card className="h-full">
          <Button
            onClick={() => onDownloadDataset?.("csv")}
            className="block mt-2 text-center"
          >
            Download CSV
          </Button>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Download recording metadata in CSV format. Convenient for editing in
            tabular software.
          </p>
        </Card>
        <Card className="h-full">
          <Button
            onClick={() => onDownloadDataset?.("json")}
            className="block mt-2 text-center"
          >
            Download JSON
          </Button>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Download recording metadata in JSON format. Data is structured in
            AEOF format; refer to our website for more details.
          </p>
        </Card>
      </div>
    </div>
  );
}
