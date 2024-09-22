import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import useAnnotationTasks from "@/app/hooks/api/useAnnotationTasks";

import AnnotationProjectProgressBase from "@/lib/components/annotation_projects/AnnotationProjectProgress";

import type { AnnotationProject } from "@/lib/types";

export default function AnnotationProjectProgress({
  annotationProject,
}: {
  annotationProject: AnnotationProject;
}) {
  const router = useRouter();

  const filter = useMemo(
    () => ({
      annotation_project: annotationProject,
    }),
    [annotationProject],
  );

  const { items, isLoading } = useAnnotationTasks({
    filter,
    pageSize: -1,
  });

  const handleClickAddTag = useCallback(() => {
    router.push(
      `/annotation_projects/detail/tasks/?annotation_project_uuid=${annotationProject.uuid}`,
    );
  }, [router, annotationProject.uuid]);

  return (
    <AnnotationProjectProgressBase
      isLoading={isLoading}
      annotationTasks={items}
      onAddTasks={handleClickAddTag}
    />
  );
}
