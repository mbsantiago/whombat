import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

import api from "@/app/api";
import AnnotationProjectCreateBase from "@/lib/components/annotation_projects/AnnotationProjectCreate";

import type { AxiosError } from "axios";
import type { AnnotationProject } from "@/lib/types";

export default function AnnotationProjectCreate({
  onCreateAnnotationProject,
  onError,
}: {
  onCreateAnnotationProject?: (project: AnnotationProject) => void;
  onError?: (error: AxiosError) => void;
}) {
  const { mutate } = useMutation({
    mutationFn: api.annotationProjects.create,
    onError: onError,
    onSuccess: (project) => {
      toast.success(`Annotation project ${project.name} created`);
      onCreateAnnotationProject?.(project);
    },
  });
  return <AnnotationProjectCreateBase onCreateAnnotationProject={mutate} />;
}
