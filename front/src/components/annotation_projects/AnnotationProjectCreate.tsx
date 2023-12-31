import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

import {
  type AnnotationProjectCreate,
  AnnotationProjectCreateSchema,
} from "@/api/annotation_projects";
import api from "@/app/api";
import { Input, InputGroup, Submit, TextArea } from "@/components/inputs/index";

import type { AnnotationProject } from "@/types";

export default function CreateProject({
  onCreate,
  onError,
}: {
  onCreate?: (project: Promise<AnnotationProject>) => void;
  onError?: (error: AxiosError) => void;
}) {
  const form = useForm<AnnotationProject>({
    resolver: zodResolver(AnnotationProjectCreateSchema),
    mode: "onChange",
  });

  const { errors } = form.formState;

  const { mutateAsync: createAnnotationProject } = useMutation({
    mutationFn: api.annotationProjects.create,
    onError: onError,
  });

  const onSubmit = useCallback(
    async (data: AnnotationProjectCreate) => {
      const project = createAnnotationProject(data);
      if (onCreate) {
        onCreate(project);
      }
    },
    [createAnnotationProject, onCreate],
  );

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <InputGroup
        label="Name"
        name="name"
        help="Please provide a name for the Annotation Project."
        error={errors.name?.message}
      >
        <Input {...form.register("name")} />
      </InputGroup>
      <InputGroup
        label="Description"
        name="description"
        help="Describe the purpose of the project"
        error={errors.description?.message}
      >
        <TextArea rows={6} {...form.register("description")} />
      </InputGroup>
      <InputGroup
        label="Instructions"
        name="annotation_instructions"
        help="Write instructions for annotators."
        error={errors.annotation_instructions?.message}
      >
        <TextArea rows={10} {...form.register("annotation_instructions")} />
      </InputGroup>
      <Submit>Create Project</Submit>
    </form>
  );
}
