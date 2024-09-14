import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import api from "@/app/api";
import Alert from "@/lib/components/ui/Alert";
import Button from "@/lib/components/ui/Button";
import {
  CloseIcon,
  DeleteIcon,
  DownloadIcon,
  WarningIcon,
} from "@/lib/components/icons";

import type { Dataset } from "@/lib/types";

function DeleteDataset({ dataset }: { dataset: Dataset }) {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: api.datasets.delete,
    onSuccess: () => {
      router.push(`/datasets/`);
    },
  });

  const handleDelete = async () => {
    if (dataset == null) return;
    toast.promise(mutation.mutateAsync(dataset), {
      loading: "Deleting dataset... please wait",
      success: "Dataset deleted",
      error: "Failed to delete dataset",
    });
  };

  return (
    <Alert
      title={
        <>
          <WarningIcon className="inline-block mr-2 w-8 h-8 text-red-500" />
          Are you sure you want to delete this dataset?
        </>
      }
      button={
        <>
          <DeleteIcon className="inline-block mr-2 w-5 h-5" />
          Delete Dataset
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
                recordings in the dataset and all associated objects. This
                includes any annotations, notes, and tags associated with the
                recordings in this dataset.
              </p>
              <p className="font-semibold text-red-600 dark:text-red-400">
                It is not recommended to delete a dataset with recordings that
                have been annotated.
              </p>
              <p>Do you want to proceed?</p>
            </div>
            <div className="flex flex-row gap-2 justify-end mt-4">
              <Button
                tabIndex={0}
                mode="text"
                variant="danger"
                onClick={handleDelete}
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

export default function DatasetActions({
  dataset,
  downloadLink,
}: {
  dataset: Dataset;
  downloadLink?: string;
}) {
  return (
    <div className="flex flex-row gap-2 justify-center">
      {downloadLink != null ? (
        <a href={downloadLink} target="_blank" download={`dataset.json`}>
          <Button mode="text" variant="primary">
            <DownloadIcon className="inline-block mr-2 w-5 h-5" /> Download
          </Button>
        </a>
      ) : null}
      <DeleteDataset dataset={dataset} />
    </div>
  );
}
