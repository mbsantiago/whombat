import { type Dataset } from "@/api/schemas";
import Button from "@/components/Button";
import DatasetExport from "@/components/datasets/DatasetExport";
import Dialog from "@/components/Dialog";
import { DownloadIcon, RecordingsIcon, UploadIcon } from "@/components/icons";

export function DatasetRecordingsNav({ dataset }: { dataset: Dataset }) {
  return (
    <div className="flex flex-row justify-between items-center mb-3 space-x-4">
      <div>
        <RecordingsIcon className="inline-block mr-1 w-5 h-5 align-middle text-stone-500" />
        <span className="mr-1 font-semibold text-stone-500">
          {dataset?.recording_count}
        </span>
        <span className="font-thin">Recordings</span>
      </div>
      <ul className="flex flex-row space-x-3">
        <li>
          <Button mode="text" variant="secondary">
            <UploadIcon className="inline-block mr-1 w-5 h-5 text-emerald-500 align-middle" />
            import
          </Button>
        </li>
        <li>
          <Dialog
            title="Export Recording Metadata"
            mode="text"
            variant="secondary"
            label={
              <>
                <DownloadIcon className="inline-block mr-1 w-5 h-5 text-emerald-500 align-middle" />
                export
              </>
            }
          >
            {() => <DatasetExport dataset={dataset} />}
          </Dialog>
        </li>
      </ul>
    </div>
  );
}
