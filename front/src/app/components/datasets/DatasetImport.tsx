import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

import api from "@/app/api";
import { copyErrorToClipboard } from "@/app/lib/errors";
import DatasetImportBase from "@/lib/components/datasets/DatasetImport";
import ErrorModal from "@/lib/components/ui/ErrorModal";
import ErrorToast from "@/lib/components/ui/ErrorToast";
import Portal from "@/lib/components/ui/Portal";
import type { Dataset, DatasetImport } from "@/lib/types";

export default function DatasetImport({
  onImportDataset,
  onError,
}: {
  onImportDataset?: (project: Dataset) => void;
  onError?: (error: AxiosError) => void;
}) {
  const [detailedError, setDetailedError] = useState<AxiosError | null>(null);

  const { mutateAsync } = useMutation({
    mutationFn: api.datasets.import,
    onError: onError,
    onSuccess: onImportDataset,
  });

  const handleImportProject = useCallback(
    async (data: DatasetImport) => {
      toast.promise(
        mutateAsync(data),
        {
          loading: "Importing dataset...",
          success: "Dataset imported",
          error: (error: AxiosError) => (
            <ErrorToast
              message="Error importing dataset"
              onShowDetails={() => {
                setDetailedError(error);
                toast.dismiss("import-dataset");
              }}
              onCopy={() => {
                copyErrorToClipboard(error);
                toast.dismiss("import-dataset");
              }}
            />
          ),
        },
        {
          id: "import-dataset",
        },
      );
    },
    [mutateAsync],
  );

  return (
    <>
      <DatasetImportBase onImportDataset={handleImportProject} />
      {detailedError != null && (
        <Portal>
          <ErrorModal
            message="Error importing dataset"
            error={detailedError}
            onClose={() => setDetailedError(null)}
          />
        </Portal>
      )}
    </>
  );
}
