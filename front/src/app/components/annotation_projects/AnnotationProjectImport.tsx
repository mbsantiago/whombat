import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

import api from "@/app/api";
import { copyErrorToClipboard } from "@/app/lib/errors";
import AnnotationProjectImportBase from "@/lib/components/annotation_projects/AnnotationProjectImport";
import ErrorModal from "@/lib/components/ui/ErrorModal";
import ErrorToast from "@/lib/components/ui/ErrorToast";
import Portal from "@/lib/components/ui/Portal";
import type { AnnotationProject, AnnotationProjectImport } from "@/lib/types";

export default function AnnotationProjectImport({
  onImportAnnotationProject,
  onError,
}: {
  onImportAnnotationProject?: (project: AnnotationProject) => void;
  onError?: (error: AxiosError) => void;
}) {
  const [importError, setImportError] = useState<AxiosError | null>(null);

  const { mutateAsync } = useMutation({
    mutationFn: api.annotationProjects.import,
    onError: onError,
    onSuccess: onImportAnnotationProject,
  });

  const handleImportProject = useCallback(
    async (data: AnnotationProjectImport) => {
      toast.promise(
        mutateAsync(data),
        {
          loading: "Importing project...",
          success: "Project imported",
          error: (error: AxiosError) => (
            <ErrorToast
              message="Error importing annotation project"
              onShowDetails={() => {
                setImportError(error);
                toast.dismiss("import-annotation-project");
              }}
              onCopy={() => {
                copyErrorToClipboard(error);
                toast.dismiss("import-annotation-project");
                toast.success("Copied error to clipboard");
              }}
            />
          ),
        },
        {
          id: "import-annotation-project",
        },
      );
    },
    [mutateAsync],
  );

  return (
    <>
      <AnnotationProjectImportBase
        onImportAnnotationProject={handleImportProject}
      />
      {importError != null && (
        <Portal>
          <ErrorModal
            message="Error importing annotation project"
            error={importError}
            onClose={() => setImportError(null)}
            onCopy={() => {
              copyErrorToClipboard(importError);
              toast.success("Copied error to clipboard");
            }}
          />
        </Portal>
      )}
    </>
  );
}
