import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useCallback } from "react";
import toast from "react-hot-toast";

import api from "@/app/api";

import AnnotationProjectImportBase from "@/lib/components/annotation_projects/AnnotationProjectImport";

import type { AnnotationProject, AnnotationProjectImport } from "@/lib/types";

export default function AnnotationProjectImport({
  onImportAnnotationProject,
  onError,
}: {
  onImportAnnotationProject?: (project: AnnotationProject) => void;
  onError?: (error: AxiosError) => void;
}) {
  const { mutateAsync } = useMutation({
    mutationFn: api.annotationProjects.import,
    onError: onError,
    onSuccess: onImportAnnotationProject,
  });

  const handleImportProject = useCallback(
    async (data: AnnotationProjectImport) => {
      toast.promise(mutateAsync(data), {
        loading: "Importing project...",
        success: "Project imported",
        error: "Failed to import project",
      });
    },
    [mutateAsync],
  );

  return (
    <AnnotationProjectImportBase
      onImportAnnotationProject={handleImportProject}
    />
  );
}
