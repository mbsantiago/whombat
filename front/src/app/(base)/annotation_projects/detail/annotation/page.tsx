"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useContext } from "react";

import AnnotateTasks from "@/app/components/annotation/AnnotationTasks";
import useAnnotationTask from "@/app/hooks/api/useAnnotationTask";
import Loading from "@/lib/components/ui/Loading";
import type { AnnotationTask } from "@/lib/types";

import AnnotationProjectContext from "../../../../contexts/annotationProject";

export default function Page() {
  const project = useContext(AnnotationProjectContext);
  const router = useRouter();
  const pathname = usePathname();

  const searchParams = useSearchParams();
  const taskUUID = searchParams.get("annotation_task_uuid");

  const { data: task, isLoading } = useAnnotationTask({
    uuid: taskUUID ?? "",
    enabled: taskUUID != null,
  });

  const handleChangeTask = useCallback(
    (task: AnnotationTask) => {
      const params = new URLSearchParams(searchParams);
      params.set("annotation_task_uuid", task.uuid);
      router.replace(`${pathname}?${params}`);
    },
    [router, pathname, searchParams],
  );

  if (isLoading && taskUUID != null) {
    return <Loading />;
  }

  return (
    <AnnotateTasks
      annotationProject={project}
      annotationTask={task}
      onChangeTask={handleChangeTask}
    />
  );
}
