"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import Hero from "@/components/Hero";
import classnames from "classnames";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import {
  Input,
  InputGroup,
  InputGroupCommon,
  InputInfo,
  InputSuccess,
  InputHelp,
  InputLabel,
  TextArea,
  InputError,
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
          <InputGroup>
            <InputLabel htmlFor="name">Name</InputLabel>
            <Input {...register("name")} />
            <InputHelp message="Please provide a name for the dataset." />
            {errors.name?.message && (
              <InputError message={errors.name.message} />
            )}
          </InputGroup>
          <InputGroup>
            <InputLabel htmlFor="description">Description</InputLabel>
            <TextArea {...register("description")} />
            {errors.description?.message && (
              <InputError message={errors.description.message} />
            )}
          </InputGroup>
          <InputGroupCommon
            label="Audio Directory"
            name="audio_dir"
            register={register}
            errors={errors.audio_dir}
          />
          <div className="mb-3">
            <Button
              variant={mutation.isLoading ? "info" : "primary"}
              type="submit"
              className={classnames("m-0 w-full", {
                "bg-stone-500": !mutation.isLoading,
              })}
            >
              {mutation.isLoading ? <Spinner variant="success" /> : "Create"}
            </Button>
            {mutation.isLoading ? (
              <InputInfo message="Please wait. This could take a while..." />
            ) : mutation.isError ? (
              <InputError message="Something went wrong. Please try again." />
            ) : mutation.isSuccess ? (
              <InputSuccess message="Success! Redirecting..." />
            ) : null}
          </div>
        </form>
      </div>
    </>
  );
}
