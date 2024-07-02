import Alert from "@/components/Alert";
import Button from "@/components/Button";
import {
  CloseIcon,
  DeleteIcon,
  DownloadIcon,
  WarningIcon,
} from "@/components/icons";
import Link from "@/components/Link";
import useRecording from "@/lib/hooks/api/useRecording";

import type { Recording } from "@/lib/types";

function DeleteRecording({ onDelete }: { onDelete?: () => void }) {
  return (
    <Alert
      title={
        <>
          <WarningIcon className="inline-block w-8 h-8 mr-2 text-red-500" />
          Are you sure you want to delete this recording?
        </>
      }
      button={
        <>
          <DeleteIcon className="inline-block w-5 h-5 mr-2" />
          Delete Recording
        </>
      }
      mode="text"
      variant="danger"
    >
      {({ close }) => {
        return (
          <>
            <div className="flex flex-col gap-2">
              <p>
                This action cannot be undone. This will permanently delete the
                recording from the database and remove the metadata and all
                associated files. This includes any annotations, notes, and tags
                associated with the recording.
              </p>
              <p className="font-semibold dark:text-red-400 text-red-600">
                It is not recommended to delete a recording that has been
                annotated.
              </p>
              <p>Do you want to proceed?</p>
            </div>
            <div className="flex flex-row justify-end gap-2 mt-4">
              <Button
                tabIndex={0}
                mode="text"
                variant="danger"
                onClick={onDelete}
              >
                <DeleteIcon className="h-5 w-5 inline-block mr-2" />
                Delete
              </Button>
              <Button
                tabIndex={1}
                mode="outline"
                variant="primary"
                onClick={close}
              >
                <CloseIcon className="h-5 w-5 inline-block mr-2" />
                Cancel
              </Button>
            </div>
          </>
        );
      }}
    </Alert>
  );
}

export default function RecordingActions({
  recording,
  onDelete,
}: {
  recording: Recording;
  onDelete?: () => void;
}) {
  const { downloadURL, delete: deleteRecording } = useRecording({
    uuid: recording.uuid,
    recording,
    onDelete,
  });

  return (
    <div className="flex flex-row gap-2 justify-center">
      <Link
        mode="text"
        variant="primary"
        href={downloadURL || ""}
        aria-disabled={downloadURL == null}
        download
      >
        <DownloadIcon className="h-5 w-5 inline-block mr-2" /> Download
      </Link>
      <DeleteRecording
        // @ts-ignore
        onDelete={() => deleteRecording.mutate()}
      />
    </div>
  );
}
