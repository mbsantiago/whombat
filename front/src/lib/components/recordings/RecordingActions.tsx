import Alert from "@/lib/components/ui/Alert";
import Button from "@/lib/components/ui/Button";
import Link from "@/lib/components/ui/Link";
import {
  CloseIcon,
  DeleteIcon,
  DownloadIcon,
  WarningIcon,
} from "@/lib/components/icons";

function DeleteRecording({ onDelete }: { onDelete?: () => void }) {
  return (
    <Alert
      title={
        <>
          <WarningIcon className="inline-block mr-2 w-8 h-8 text-red-500" />
          Are you sure you want to delete this recording?
        </>
      }
      button={
        <>
          <DeleteIcon className="inline-block mr-2 w-5 h-5" />
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
              <p className="font-semibold text-red-600 dark:text-red-400">
                It is not recommended to delete a recording that has been
                annotated.
              </p>
              <p>Do you want to proceed?</p>
            </div>
            <div className="flex flex-row gap-2 justify-end mt-4">
              <Button
                tabIndex={0}
                mode="text"
                variant="danger"
                onClick={onDelete}
              >
                <DeleteIcon className="inline-block mr-2 w-5 h-5" />
                Delete
              </Button>
              <Button
                tabIndex={1}
                mode="outline"
                variant="primary"
                onClick={close}
              >
                <CloseIcon className="inline-block mr-2 w-5 h-5" />
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
  downloadURL,
  onDelete,
}: {
  downloadURL?: string;
  onDelete?: () => void;
}) {
  return (
    <div className="flex flex-row gap-2 justify-center">
      <Link mode="text" variant="primary" href={downloadURL || ""}>
        <DownloadIcon className="inline-block mr-2 w-5 h-5" /> Download
      </Link>
      <DeleteRecording onDelete={onDelete} />
    </div>
  );
}
