import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import api from "@/app/api";
import Button from "@/components/Button";
import Alert from "@/components/Alert";
import { type Dataset } from "@/api/datasets";
import {
  CloseIcon,
  DeleteIcon,
  DownloadIcon,
  WarningIcon,
} from "@/components/icons";

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
    toast.promise(mutation.mutateAsync(dataset.id), {
      loading: "Deleting dataset... please wait",
      success: "Dataset deleted",
      error: "Failed to delete dataset",
    });
  };

  return (
    <Alert
      title={
        <>
          <WarningIcon className="inline-block w-8 h-8 mr-2 text-red-500" />
          Are you sure you want to delete this dataset?
        </>
      }
      button={
        <>
          <DeleteIcon className="inline-block w-5 h-5 mr-2" />
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
              <p className="font-semibold dark:text-red-400 text-red-600">
                It is not recommended to delete a dataset with recordings that
                have been annotated.
              </p>
              <p>Do you want to proceed?</p>
            </div>
            <div className="flex flex-row justify-end gap-2 mt-4">
              <Button
                tabIndex={0}
                mode="text"
                variant="danger"
                onClick={handleDelete}
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
            <DownloadIcon className="h-5 w-5 inline-block mr-2" /> Download
          </Button>
        </a>
      ) : null}
      <DeleteDataset dataset={dataset} />
    </div>
  );
}
