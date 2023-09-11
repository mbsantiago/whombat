"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import Hero from "@/components/Hero";
import {
  Submit,
  Input,
  InputGroup,
  TextArea,
} from "@/components/inputs";
import api from "@/app/api";
import { type DatasetCreate, DatasetCreateSchema } from "@/api/datasets";

export default function CreateDataset() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: api.datasets.create,
    onSuccess: (data) => {
      router.push(`/datasets/${data.uuid}/`);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatasetCreate>({
    resolver: zodResolver(DatasetCreateSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: DatasetCreate) => mutation.mutate(data);

  return (
    <>
      <Hero text="Create Dataset" />
      <div className="flex w-1/2 flex-col items-start p-8">
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          <InputGroup
            name="name"
            label="Name"
            help="Please provide a name for the dataset."
            error={errors.name?.message}
          >
            <Input {...register("name")} />
          </InputGroup>
          <InputGroup
            name="description"
            label="Description"
            help="Describe the dataset."
            error={errors.description?.message}
          >
            <TextArea {...register("description")} />
          </InputGroup>
          <InputGroup
            name="audio_dir"
            label="Audio Directory"
            help="Provide the path to the folder where the dataset recordings reside."
            error={errors.name?.message}
          >
            <Input {...register("audio_dir")} />
          </InputGroup>
          <div className="mb-3">
            <Submit
              loading={mutation.isLoading}
              success={mutation.isSuccess}
              error={mutation.isError}
            >
              Create Dataset
            </Submit>
          </div>
        </form>
      </div>
    </>
  );
}
