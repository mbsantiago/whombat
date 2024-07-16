import Alert from "@/lib/components/ui/Alert";
import Button from "@/lib/components/ui/Button";
import { CloseIcon, DeleteIcon, WarningIcon } from "@/lib/components/icons";

export default function DeleteModelRun({
  onDelete,
}: {
  onDelete?: () => void;
}) {
  return (
    <Alert
      title={
        <>
          <WarningIcon className="inline-block w-8 h-8 mr-2 text-red-500" />
          Are you sure you want to delete this model run?
        </>
      }
      button={
        <>
          <DeleteIcon className="inline-block w-5 h-5 mr-2" />
          Delete
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
                model run with all its predictions and evaluations.
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
