import { CloseIcon, DeleteIcon, WarningIcon } from "@/lib/components/icons";
import Alert from "@/lib/components/ui/Alert";
import Button from "@/lib/components/ui/Button";

import type { ModelRun } from "@/lib/types";

export default function ModelRunActions({
  modelRun,
  onDeleteModelRun,
}: {
  modelRun: ModelRun;
  onDeleteModelRun?: () => void;
}) {
  return (
    <div className="flex flex-row gap-2 justify-center">
      <DeleteModelRun onDelete={onDeleteModelRun} modelRun={modelRun} />
    </div>
  );
}

export function DeleteModelRun({
  modelRun,
  onDelete,
}: {
  modelRun: ModelRun;
  onDelete?: () => void;
}) {
  return (
    <Alert
      title={
        <>
          <WarningIcon className="inline-block mr-2 w-8 h-8 text-red-500" />
          Are you sure you want to delete this model run?
        </>
      }
      button={
        <>
          <DeleteIcon className="inline-block mr-2 w-5 h-5" />
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
              <h2 className="p-4 font-extrabold text-center">
                {modelRun.name}
              </h2>
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
