import Button from "@/components/Button";
import Alert from "@/components/Alert";
import {
  DeleteIcon,
  WarningIcon,
  CloseIcon,
  DownloadIcon,
} from "@/components/icons";

function DeleteProject({ onDelete }: { onDelete?: () => void }) {
  return (
    <Alert
      title={
        <>
          <WarningIcon className="inline-block w-8 h-8 mr-2 text-red-500" />
          Are you sure you want to delete this project?
        </>
      }
      button={
        <>
          <DeleteIcon className="inline-block w-5 h-5 mr-2" />
          Delete Project
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
                This action cannot be undone. All annotations and recordings
                associated with this project will be deleted.
              </p>
              <p>Do you want to proceed?</p>
            </div>
            <div className="flex flex-row justify-end gap-2 mt-4">
              <Button mode="outline" variant="primary" onClick={close}>
                <CloseIcon className="h-5 w-5 inline-block mr-2" />
                Cancel
              </Button>
              <Button mode="text" variant="danger" onClick={onDelete}>
                <DeleteIcon className="h-5 w-5 inline-block mr-2" />
                Delete
              </Button>
            </div>
          </>
        );
      }}
    </Alert>
  );
}

export default function ProjectActions({
  onDelete,
  onDownload,
}: {
  onDelete?: () => void;
  onDownload?: () => void;
}) {
  return (
    <div className="flex flex-row gap-2 justify-center">
      <Button mode="text" variant="primary" onClick={onDownload}>
        <DownloadIcon className="h-5 w-5 inline-block mr-2" /> Download
      </Button>
      <DeleteProject onDelete={onDelete} />
    </div>
  );
}
