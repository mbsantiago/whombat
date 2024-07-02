"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import toast from "react-hot-toast";

import AnnotationProjectList from "@/components/annotation_projects/AnnotationProjectList";
import Hero from "@/components/Hero";

import type { AnnotationProject } from "@/lib/types";

export default function AnnotationProjects() {
  const router = useRouter();

  const onCreate = useCallback(
    async (project: Promise<AnnotationProject>) => {
      toast.promise(project, {
        loading: "Creating project...",
        success: "Project created!",
        error: "Failed to create project",
      });

      project.then((data) => {
        router.push(
          `/annotation_projects/detail/?annotation_project_uuid=${data.uuid}`,
        );
      });
    },
    [router],
  );

  return (
    <>
      <Hero text="Annotation Projects" />
      <AnnotationProjectList onCreate={onCreate} />
    </>
  );
}
