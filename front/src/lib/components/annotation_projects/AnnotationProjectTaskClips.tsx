import { useMemo } from "react";

import AnnotationTaskTable from "@/lib/components/annotation_tasks/AnnotationTaskTable";

import type { AnnotationProject, AnnotationTask } from "@/lib/types";

export default function AnnotationProjectTaskClips({
  annotationProject,
  getAnnotationTaskLink: getAnnotationTaskLinkFn,
}: {
  annotationProject: AnnotationProject;
  getAnnotationTaskLink?: (annotationTask: AnnotationTask) => string;
}) {
  const getAnnotationTaskLink = useMemo(() => {
    if (getAnnotationTaskLinkFn == null) return undefined;

    return (annotationTask: AnnotationTask) => {
      const url = getAnnotationTaskLinkFn(annotationTask);
      return `${url}&annotation_project_uuid=${annotationProject.uuid}`;
    };
  }, [getAnnotationTaskLinkFn, annotationProject.uuid]);
  const filter = useMemo(
    () => ({ annotation_project: annotationProject }),
    [annotationProject],
  );

  return (
    <AnnotationTaskTable
      filter={filter}
      fixed={["annotation_project"]}
      getAnnotationTaskLink={getAnnotationTaskLink}
      // pathFormatter={pathFormatter}  TODO: if there was a dataset column, the path could be formatted as in the recordings table
    />
  );
}
