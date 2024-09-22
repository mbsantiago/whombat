"use client";

import { useRouter } from "next/navigation";
import { useCallback, useContext } from "react";

import AnnotationProjectDetail from "@/app/components/annotation_projects/AnnotationProjectDetail";

import AnnotationProjectContext from "../../../contexts/annotationProject";

export default function Page() {
  const annotationProject = useContext(AnnotationProjectContext);
  const router = useRouter();

  const handleDeleteAnnotationProject = useCallback(
    () => router.push("/annotation_projects"),
    [router],
  );

  return (
    <AnnotationProjectDetail
      annotationProject={annotationProject}
      onDeleteAnnotationProject={handleDeleteAnnotationProject}
    />
  );
}
