"use client";
import { useContext } from "react";
import { useSearchParams } from "next/navigation";
import useAnnotationTask from "@/app/hooks/api/useAnnotationTask";

import Loading from "@/lib/components/ui/Loading";
import AnnotateTasks from "@/app/components/annotation/AnnotationTasks";
import AnnotationProjectContext from "../../../../contexts/annotationProject";

export default function Page() {
  const project = useContext(AnnotationProjectContext);

  const searchParams = useSearchParams();
  const taskUUID = searchParams.get("annotation_task_uuid");

  const { data: task, isLoading } = useAnnotationTask({
    uuid: taskUUID ?? "",
    enabled: !!taskUUID,
  });

  if (isLoading) {
    return <Loading />;
  }

  return <AnnotateTasks annotationProject={project} annotationTask={task} />;
}
