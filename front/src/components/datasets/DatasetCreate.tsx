import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

import { type DatasetCreate, DatasetCreateSchema } from "@/lib/api/datasets";
import api from "@/app/api";
import { Input, InputGroup, Submit, TextArea } from "@/components/inputs/index";

import type { Dataset } from "@/types";

/**
 * Component for creating a new dataset.
 *
 * @param onCreate - Callback function triggered when the dataset is
 * successfully created.
 * @returns JSX element containing a form for creating a
 * new dataset.
 */
export default function CreateDataset({
  onCreate,
}: {
  onCreate?: (dataset: Promise<Dataset>) => void;
}) {
  const { mutateAsync: createDataset } = useMutation({
    mutationFn: api.datasets.create,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatasetCreate>({
    resolver: zodResolver(DatasetCreateSchema),
    mode: "onChange",
  });

  const onSubmit = useCallback(
    async (data: DatasetCreate) => {
      const promise = createDataset(data);
      onCreate?.(promise);
    },
    [createDataset, onCreate],
  );

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
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
  );
}
