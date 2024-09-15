"use client";
import { notFound, useRouter } from "next/navigation";
import { useCallback, useContext } from "react";
import toast from "react-hot-toast";

import AnnotationProjectTasks from "@/app/components/annotation_projects/AnnotationProjectTasks";
import Center from "@/lib/components/layouts/Center";
import AnnotationProjectContext from "@/app/contexts/annotationProject";

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
      <AnnotationProjectTasks
        annotationProject={project}
        onAddTasks={onCreateTasks}
      />
    </Center>
  );
}
