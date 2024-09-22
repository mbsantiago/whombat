"use client";

import { useSearchParams } from "next/navigation";
import { useContext } from "react";

import AnnotateTasks from "@/app/components/annotation/AnnotationTasks";

import useAnnotationTask from "@/app/hooks/api/useAnnotationTask";

import Loading from "@/lib/components/ui/Loading";

import AnnotationProjectContext from "../../../../contexts/annotationProject";

export default function Page() {
  const project = useContext(AnnotationProjectContext);

  const searchParams = useSearchParams();
  const taskUUID = searchParams.get("annotation_task_uuid");

  const { data: task, isLoading } = useAnnotationTask({
    uuid: taskUUID ?? "",
    enabled: taskUUID != null,
  });

  if (isLoading && taskUUID != null) {
    return <Loading />;
  }

  return <AnnotateTasks annotationProject={project} annotationTask={task} />;
}
