import * as icons from "@/lib/components/icons";
import Alert from "@/lib/components/ui/Alert";
import Button from "@/lib/components/ui/Button";

import type * as types from "@/lib/types";

export default function EvaluationSetActions({
  evaluationSet,
  onDelete,
  onDownload,
}: {
  evaluationSet: types.EvaluationSet;
  onDelete?: () => void;
  onDownload?: () => void;
}) {
  return (
    <div className="flex flex-row gap-2 justify-center">
      <Button mode="text" variant="primary" onClick={onDownload}>
        <icons.DownloadIcon className="inline-block mr-2 w-5 h-5" /> Download
      </Button>
      <DeleteEvaluationSet onDelete={onDelete} evaluationSet={evaluationSet} />
    </div>
  );
}

function DeleteEvaluationSet({
  onDelete,
  evaluationSet,
}: {
  onDelete?: () => void;
  evaluationSet: types.EvaluationSet;
}) {
  return (
    <Alert
      title={
        <>
          <icons.WarningIcon className="inline-block mr-2 w-8 h-8 text-red-500" />
          Are you sure you want to delete this evaluation set?
        </>
      }
      button={
        <>
          <icons.DeleteIcon className="inline-block mr-2 w-5 h-5" />
          Delete Set
        </>
      }
      mode="text"
      variant="danger"
    >
      {({ close }) => {
        return (
          <>
            <div className="flex flex-col gap-2">
              <h2 className="p-4 font-extrabold text-center">
                {evaluationSet.name}
              </h2>
              <p>
                This action cannot be undone. All evaluations stored in this set
                will be deleted.
              </p>
              <p>Do you want to proceed?</p>
            </div>
            <div className="flex flex-row gap-2 justify-end mt-4">
              <Button mode="outline" variant="primary" onClick={close}>
                <icons.CloseIcon className="inline-block mr-2 w-5 h-5" />
                Cancel
              </Button>
              <Button mode="text" variant="danger" onClick={onDelete}>
                <icons.DeleteIcon className="inline-block mr-2 w-5 h-5" />
                Delete
              </Button>
            </div>
          </>
        );
      }}
    </Alert>
  );
}
