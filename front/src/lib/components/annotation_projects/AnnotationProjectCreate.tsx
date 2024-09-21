import {
  type AnnotationProjectCreate,
  AnnotationProjectCreateSchema,
} from "@/lib/api/annotation_projects";
import {
  Input,
  InputGroup,
  Submit,
  TextArea,
} from "@/lib/components/inputs/index";
import type { AnnotationProject } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

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
      <InputGroup
        label="Name"
        name="name"
        help="Please provide a name for the Annotation Project."
        error={errors.name?.message}
      >
        <Input {...register("name")} />
      </InputGroup>
      <InputGroup
        label="Description"
        name="description"
        help="Describe the purpose of the project"
        error={errors.description?.message}
      >
        <TextArea rows={6} {...register("description")} />
      </InputGroup>
      <InputGroup
        label="Instructions"
        name="annotation_instructions"
        help="Write instructions for annotators."
        error={errors.annotation_instructions?.message}
      >
        <TextArea rows={10} {...register("annotation_instructions")} />
      </InputGroup>
      <Submit>Create Project</Submit>
    </form>
  );
}
