"use client";

import AnnotationProjectList from "@/app/components/annotation_projects/AnnotationProjectList";
import Hero from "@/lib/components/ui/Hero";
import type { AnnotationProject } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function AnnotationProjects() {
  const router = useRouter();

  const handleClickAnnotationProject = useCallback(
    (project: AnnotationProject) => {
      router.push(
        `/annotation_projects/detail/?annotation_project_uuid=${project.uuid}`,
      );
    },
    [router],
  );

  return (
    <>
      <Hero text="Annotation Projects" />
      <AnnotationProjectList
        onClickAnnotationProject={handleClickAnnotationProject}
        onCreateAnnotationProject={handleClickAnnotationProject}
      />
    </>
  );
}
