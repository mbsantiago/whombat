import DatasetExport from "@/lib/components/datasets/DatasetExport";
import { DownloadIcon, RecordingsIcon } from "@/lib/components/icons";
import SecondaryNavBar from "@/lib/components/navigation/SecondaryNavBar";
import Dialog from "@/lib/components/ui/Dialog";
import type { Dataset } from "@/lib/types";
import { ComponentProps } from "react";

export default function DatasetRecordingSummary({
  dataset,
  ...props
}: { dataset: Dataset } & ComponentProps<typeof DatasetExport>) {
  return (
    <SecondaryNavBar
      title="Recordings"
      icon={
        <>
          <RecordingsIcon className="inline-block mr-1 w-5 h-5 align-middle text-stone-500" />
          <span className="mr-1 font-semibold text-stone-500">
            {dataset?.recording_count}
          </span>
        </>
      }
      buttons={[
        <Dialog
          key="export"
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
          {() => <DatasetExport {...props} />}
        </Dialog>,
      ]}
    />
  );
}
