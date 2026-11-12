import { Portal } from "@headlessui/react";
import { type AxiosError } from "axios";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

import useAnnotationProject from "@/app/hooks/api/useAnnotationProject";
import { copyErrorToClipboard } from "@/app/lib/errors";
import AnnotationProjectActionsBase from "@/lib/components/annotation_projects/AnnotationProjectActions";
import ErrorModal from "@/lib/components/ui/ErrorModal";
import ErrorToast from "@/lib/components/ui/ErrorToast";
import type { AnnotationProject } from "@/lib/types";

export default function AnnotationProjectActions({
  annotationProject,
  onDeleteAnnotationProject,
}: {
  annotationProject: AnnotationProject;
  onDeleteAnnotationProject?: () => void;
}) {
  const [deleteError, setDeleteError] = useState<AxiosError | null>(null);
  const [downloadError, setDownloadError] = useState<AxiosError | null>(null);

  const { delete: deleteAnnotationProject, download } = useAnnotationProject({
    uuid: annotationProject.uuid,
    annotationProject,
    onDelete: onDeleteAnnotationProject,
  });

  const handleDownload = useCallback(async () => {
    toast.promise(
      download(),
      {
        loading: "Downloading project...",
        success: "Annotation project downloaded!",
        error: (error: AxiosError) => (
          <ErrorToast
            message="Error downloading annotation project"
            onShowDetails={() => {
              setDownloadError(error);
              toast.dismiss("download-annotation-project");
            }}
            onCopy={() => {
              copyErrorToClipboard(error);
              toast.dismiss("download-annotation-project");
            }}
          />
        ),
      },
      {
        id: "download-annotation-project",
      },
    );
  }, [download]);

  const handleDelete = useCallback(async () => {
    toast.promise(
      deleteAnnotationProject.mutateAsync(annotationProject),
      {
        loading: "Deleting project...",
        success: "Project deleted",
        error: (error: AxiosError) => (
          <ErrorToast
            message="Error deleting annotation project"
            onShowDetails={() => {
              setDeleteError(error);
              toast.dismiss("delete-annotation-project");
            }}
            onCopy={() => {
              copyErrorToClipboard(error);
              toast.dismiss("delete-annotation-project");
            }}
          />
        ),
      },
      {
        id: "delete-annotation-project",
      },
    );
  }, [deleteAnnotationProject, annotationProject]);

  return (
    <>
      <AnnotationProjectActionsBase
        annotationProject={annotationProject}
        onDeleteAnnotationProject={handleDelete}
        onDownloadAnnotationProject={handleDownload}
      />
      {downloadError != null && (
        <Portal>
          <ErrorModal
            message="Error downloading annotation project"
            error={downloadError}
            onClose={() => setDownloadError(null)}
          />
        </Portal>
      )}
      {deleteError != null && (
        <Portal>
          <ErrorModal
            message="Error deleting annotation project"
            error={deleteError}
            onClose={() => setDeleteError(null)}
          />
        </Portal>
      )}
    </>
  );
}
