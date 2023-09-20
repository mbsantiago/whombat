import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import api from "@/app/api";
import { Input, InputGroup, Submit, TextArea } from "@/components/inputs";
import {
  type AnnotationProject,
  type AnnotationProjectCreate,
  AnnotationProjectCreateSchema,
} from "@/api/annotation_projects";

export default function CreateProject({
  onCreate,
}: {
  onCreate: (project: AnnotationProject) => void;
}) {
  const form = useForm<AnnotationProject>({
    resolver: zodResolver(AnnotationProjectCreateSchema),
    mode: "onChange",
  });

  const { errors } = form.formState;

  const create = useMutation({
    mutationFn: api.annotation_projects.create,
    onSuccess: (data) => {
      onCreate(data);
    },
  });

  const onSubmit = async (data: AnnotationProjectCreate) => {
    toast.promise(create.mutateAsync(data), {
      loading:
        "Creating project. Please wait while the folder is scanned for recordings.",
      success: "Project created!",
      error: "Something went wrong. Please try again.",
    });
  };

  return (
    <form
      className="w-full"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <InputGroup
        label="Name"
        name="name"
        help="Please provide a name for the Annotation Project."
        error={errors.name?.message}
      >
        <Input disabled={create.isSuccess} {...form.register("name")} />
      </InputGroup>
      <InputGroup
        label="Description"
        name="description"
        help="Describe the purpose of the project"
        error={errors.description?.message}
      >
        <TextArea
          disabled={create.isSuccess}
          rows={6}
          {...form.register("description")}
        />
      </InputGroup>
      <InputGroup
        label="Instructions"
        name="annotation_instructions"
        help="Write instructions for annotators."
        error={errors.annotation_instructions?.message}
      >
        <TextArea
          disabled={create.isSuccess}
          rows={10}
          {...form.register("annotation_instructions")}
        />
      </InputGroup>
      <Submit
        disabled={create.isSuccess}
      >
        Create Project
      </Submit>
    </form>
  );
}
