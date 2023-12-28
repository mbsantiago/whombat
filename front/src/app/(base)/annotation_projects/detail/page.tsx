"use client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useContext, useCallback } from "react";
import AnnotationProjectDetail from "@/components/annotation_projects/AnnotationProjectDetail";
import AnnotationProjectContext from "./context";

export default function Page() {
  const annotationProject = useContext(AnnotationProjectContext);
  const router = useRouter();

  const onDelete = useCallback(() => {
    toast.success("Project deleted");
    router.push("/annotation_projects");
  }, [router]);

  return (
    <AnnotationProjectDetail annotationProject={annotationProject} onDelete={onDelete} />
  );
}
