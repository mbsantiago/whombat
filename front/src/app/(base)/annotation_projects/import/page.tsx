"use client";

import api from "@/app/api";
import { UploadIcon } from "@/lib/components/icons";
import { Input, InputGroup, Submit } from "@/lib/components/inputs/index";
import Hero from "@/lib/components/ui/Hero";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function Page() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const { mutateAsync: importAnnotationProject } = useMutation({
    mutationFn: api.annotationProjects.import,
    onError: (error: AxiosError) => {
      if (error.response?.status === 422) {
        // @ts-ignore
        error.response.data.detail.forEach((error: any) => {
          setError(error.loc[1], { message: error.msg });
        });
      }
    },
    onSuccess: (data) => {
      router.push(
        `/annotation_projects/detail/?annotation_project_uuid=${data.uuid}`,
      );
    },
  });

  // @ts-ignore
  const onSubmit = async (data) => {
    const formData = new FormData();
    const file = data.annotation_project[0];
    formData.append("annotation_project", file);

    return await toast.promise(importAnnotationProject(formData), {
      loading:
        "Importing annotation project. Please wait, it can take some time...",
      success: "Annotation project imported successfully!",
      error: "Failed to import annotation project.",
    });
  };

  return (
    <>
      <Hero text="Import an Annotation Project" />
      <div className="flex w-full flex-col justify-center items-center p-16">
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
      </div>
    </>
  );
}
