import useAnnotationProject from "@/app/hooks/api/useAnnotationProject";
import AnnotationProjectActionsBase from "@/lib/components/annotation_projects/AnnotationProjectActions";
import type { AnnotationProject } from "@/lib/types";
import toast from "react-hot-toast";

export default function AnnotationProjectActions({
  annotationProject,
  onDeleteAnnotationProject,
}: {
  annotationProject: AnnotationProject;
  onDeleteAnnotationProject?: () => void;
}) {
  const { delete: deleteAnnotationProject, download } = useAnnotationProject({
    uuid: annotationProject.uuid,
    annotationProject,
    onDelete: onDeleteAnnotationProject,
  });

  return (
    <AnnotationProjectActionsBase
      annotationProject={annotationProject}
      onDeleteAnnotationProject={() =>
        toast.promise(deleteAnnotationProject.mutateAsync(annotationProject), {
          loading: "Deleting project...",
          success: "Project deleted",
          error: "Failed to delete project",
        })
      }
      onDownloadAnnotationProject={download}
    />
  );
}
