import useAnnotationProject from "@/app/hooks/api/useAnnotationProject";

import AnnotationProjectUpdateBase from "@/lib/components/annotation_projects/AnnotationProjectUpdate";

import type { AnnotationProject } from "@/lib/types";

export default function AnnotationProjectUpdate({
  annotationProject,
}: {
  annotationProject: AnnotationProject;
}) {
  const { data, update, isLoading } = useAnnotationProject({
    uuid: annotationProject.uuid,
    annotationProject: annotationProject,
  });

  return (
    <AnnotationProjectUpdateBase
      annotationProject={data || annotationProject}
      isLoading={isLoading}
      onChangeAnnotationProject={update.mutate}
    />
  );
}
