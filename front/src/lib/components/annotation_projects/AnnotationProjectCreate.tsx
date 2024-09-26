import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

import {
  Input,
  Group,
  Submit,
  TextArea,
} from "@/lib/components/inputs/index";

import { AnnotationProjectCreateSchema } from "@/lib/schemas";
import type { AnnotationProject, AnnotationProjectCreate } from "@/lib/types";

export default function CreateProject({
  onCreateAnnotationProject,
}: {
  onCreateAnnotationProject?: (project: AnnotationProjectCreate) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnnotationProject>({
    resolver: zodResolver(AnnotationProjectCreateSchema),
    mode: "onChange",
  });

  const onSubmit = useCallback(
    (data: AnnotationProjectCreate) => onCreateAnnotationProject?.(data),
    [onCreateAnnotationProject],
  );

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <Group
        label="Name"
        name="name"
        help="Please provide a name for the Annotation Project."
        error={errors.name?.message}
      >
        <Input {...register("name")} />
      </Group>
      <Group
        label="Description"
        name="description"
        help="Describe the purpose of the project"
        error={errors.description?.message}
      >
        <TextArea rows={6} {...register("description")} />
      </Group>
      <Group
        label="Instructions"
        name="annotation_instructions"
        help="Write instructions for annotators."
        error={errors.annotation_instructions?.message}
      >
        <TextArea rows={10} {...register("annotation_instructions")} />
      </Group>
      <Submit>Create Project</Submit>
    </form>
  );
}
