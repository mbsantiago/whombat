"use client";
import { useRouter } from "next/navigation";
import { useCallback, useContext } from "react";
import toast from "react-hot-toast";

import AnnotationProjectDetail from "@/components/annotation_projects/AnnotationProjectDetail";

import AnnotationProjectContext from "./context";

import type { AnnotationProject } from "@/lib/types";

export default function Page() {
  const annotationProject = useContext(AnnotationProjectContext);
  const router = useRouter();

  const onDelete = useCallback(
    (project: Promise<AnnotationProject>) => {
      toast.promise(project, {
        loading: "Deleting project... Please wait",
        success: "Project deleted!",
        error: "Failed to delete project",
      });

      project.then(() => {
        router.push("/annotation_projects");
      });
    },
    [router],
  );

  return (
    <AnnotationProjectDetail
      annotationProject={annotationProject}
      onDelete={onDelete}
    />
  );
}
