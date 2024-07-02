import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

import api from "@/app/api";
import { UploadIcon } from "@/components/icons";
import { Input, InputGroup, Submit } from "@/components/inputs/index";

import type { AnnotationProject } from "@/lib/types";
import type { AxiosError } from "axios";

export default function AnnotationProjectImport({
  onCreate,
}: {
  onCreate?: (data: Promise<AnnotationProject>) => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const { mutateAsync: importAnnotationProject } = useMutation<
    AnnotationProject,
    AxiosError,
    FormData
  >({
    mutationFn: api.annotationProjects.import,
    onError: (error) => {
      if (error.response?.status === 422) {
        // @ts-ignore
        error.response.data.detail.forEach((error: any) => {
          setError(error.loc[1], { message: error.msg });
        });
      }
    },
  });

  const onSubmit = useCallback(
    // @ts-ignore
    async (data) => {
      const formData = new FormData();
      const file = data.annotation_project[0];
      formData.append("annotation_project", file);
      const promise = importAnnotationProject(formData);
      onCreate?.(promise);
    },
    [importAnnotationProject, onCreate],
  );

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <InputGroup
        name="annotation_project"
        label="Select a project file to import"
        help="The file must be in AOEF format"
        // @ts-ignore
        error={errors.file?.message}
      >
        <Input type="file" {...register("annotation_project")} required />
      </InputGroup>
      <Submit>
        <UploadIcon className="inline-block h-6 w-6 align-middle mr-2" />
        Import
      </Submit>
    </form>
  );
}
