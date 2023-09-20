"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import Hero from "@/components/Hero";
import { Input, InputGroup, Submit, TextArea } from "@/components/inputs";
import api from "@/app/api";
import { type DatasetCreate, DatasetCreateSchema } from "@/api/datasets";

export default function CreateDataset() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: api.datasets.create,
    onSuccess: (data) => {
      router.push(`/datasets/detail/?dataset_id=${data.id}/`);
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

  const onSubmit = async (data: DatasetCreate) => {
    toast.promise(mutation.mutateAsync(data), {
      loading:
        "Creating dataset. Please wait while the folder is scanned for recordings.",
      success: "Dataset created successfully.",
      error: "Failed to create dataset.",
    });
  };

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
            <Submit>Create Dataset</Submit>
          </div>
        </form>
      </div>
    </>
  );
}
