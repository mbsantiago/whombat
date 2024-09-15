import AnnotationProjectActionsBase from "@/lib/components/annotation_projects/AnnotationProjectActions";
import useAnnotationProject from "@/app/hooks/api/useAnnotationProject";

import type { AnnotationProject } from "@/lib/types";

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
        deleteAnnotationProject.mutate(annotationProject)
      }
      onDownloadAnnotationProject={download}
    />
  );
}
