import Alert from "@/components/Alert";
import Button from "@/components/Button";
import {
  CloseIcon,
  DeleteIcon,
  DownloadIcon,
  WarningIcon,
} from "@/components/icons";
import Link from "@/components/Link";
import useEvaluationSet from "@/hooks/api/useEvaluationSet";

import type { EvaluationSet } from "@/types";

export default function EvaluationSetActions({
  evaluationSet,
  onDelete,
}: {
  evaluationSet: EvaluationSet;
  onDelete?: (evaluationSet: EvaluationSet) => void;
}) {
  const {
    delete: { mutate: deleteEvaluationSet },
    downloadUrl,
  } = useEvaluationSet({
    uuid: evaluationSet.uuid,
    evaluationSet,
    onDelete,
  });

  return (
    <div className="flex flex-row gap-2 justify-center">
      <Link
        mode="text"
        variant="primary"
        href={downloadUrl}
        download
        target="_blank"
      >
        <DownloadIcon className="h-5 w-5 inline-block mr-2" /> Download
      </Link>
      <DeleteEvaluationSet onDelete={deleteEvaluationSet} />
    </div>
  );
}

function DeleteEvaluationSet({ onDelete }: { onDelete?: () => void }) {
  return (
    <Alert
      title={
        <>
          <WarningIcon className="inline-block w-8 h-8 mr-2 text-red-500" />
          Are you sure you want to delete this evaluation set?
        </>
      }
      button={
        <>
          <DeleteIcon className="inline-block w-5 h-5 mr-2" />
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
              <p>
                This action cannot be undone. All evaluations stored in this set
                will be deleted.
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
