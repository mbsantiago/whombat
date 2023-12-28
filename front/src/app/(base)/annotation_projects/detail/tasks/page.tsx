"use client";
import toast from "react-hot-toast";
import { notFound, useRouter } from "next/navigation";
import { useContext, useCallback } from "react";

import AnnotationProjectTasks from "@/components/annotation_projects/AnnotationProjectTasks";
import AnnotationProjectContext from "../context";
import Center from "@/components/layouts/Center";

export default function Page() {
  const project = useContext(AnnotationProjectContext);
  const router = useRouter();

  const onCreateTasks = useCallback(() => {
    toast.success("Tasks created");
    router.push(
      `/annotation_projects/detail/?annotation_project_uuid=${project.uuid}`,
    );
  }, [project, router]);

  if (project == null) return notFound();

  return (
    <Center>
      <AnnotationProjectTasks project={project} onAddTasks={onCreateTasks} />
    </Center>
  );
}
