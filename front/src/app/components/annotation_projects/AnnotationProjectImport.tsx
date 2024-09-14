import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

import api from "@/app/api";
import AnnotationProjectImportBase from "@/lib/components/annotation_projects/AnnotationProjectImport";

import type { AxiosError } from "axios";
import type { AnnotationProject } from "@/lib/types";

export default function AnnotationProjectImport({
  onImportAnnotationProject,
  onError,
}: {
  onImportAnnotationProject?: (project: AnnotationProject) => void;
  onError?: (error: AxiosError) => void;
}) {
  const { mutate } = useMutation({
    mutationFn: api.annotationProjects.import,
    onError: onError,
    onSuccess: (project) => {
      toast.success(`Annotation project ${project.name} created`);
      onImportAnnotationProject?.(project);
    },
  });
  return <AnnotationProjectImportBase onImportAnnotationProject={mutate} />;
}
