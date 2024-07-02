import Button from "@/lib/components/Button";
import DatasetExport from "@/lib/components/datasets/DatasetExport";
import Dialog from "@/lib/components/Dialog";
import {
  DownloadIcon,
  RecordingsIcon,
  UploadIcon,
} from "@/lib/components/icons";

import SecondaryNavBar from "@/lib/components/navigation/SecondaryNavBar";
import type { Dataset } from "@/lib/types";

export default function NavBar({ dataset }: { dataset: Dataset }) {
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
        <Button key="import" mode="text" variant="secondary">
          <UploadIcon className="inline-block mr-1 w-5 h-5 text-emerald-500 align-middle" />
          import
        </Button>,
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
          {() => <DatasetExport dataset={dataset} />}
        </Dialog>,
      ]}
    />
  );
}
