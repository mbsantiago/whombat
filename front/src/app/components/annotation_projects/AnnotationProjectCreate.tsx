import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useCallback } from "react";
import toast from "react-hot-toast";

import api from "@/app/api";

import AnnotationProjectCreateBase from "@/lib/components/annotation_projects/AnnotationProjectCreate";

import type { AnnotationProject, AnnotationProjectCreate } from "@/lib/types";

export default function AnnotationProjectCreate({
  onCreateAnnotationProject,
  onError,
}: {
  onCreateAnnotationProject?: (project: AnnotationProject) => void;
  onError?: (error: AxiosError) => void;
}) {
  const { mutateAsync } = useMutation({
    mutationFn: api.annotationProjects.create,
    onError: onError,
    onSuccess: onCreateAnnotationProject,
  });

  const handleCreateProject = useCallback(
    async (data: AnnotationProjectCreate) => {
      toast.promise(mutateAsync(data), {
        loading: "Creating project...",
        success: "Project created",
        error: "Failed to create project",
      });
    },
    [mutateAsync],
  );

  return (
    <AnnotationProjectCreateBase
      onCreateAnnotationProject={handleCreateProject}
    />
  );
}
