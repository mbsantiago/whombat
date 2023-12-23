import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import api from "@/app/api";
import { Input, InputGroup, Submit, TextArea } from "@/components/inputs/index";
import { type DatasetCreate, DatasetCreateSchema } from "@/api/datasets";
import { type Dataset } from "@/api/schemas";

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
  onCreate?: (dataset: Dataset) => void;
}) {
  const mutation = useMutation({
    mutationFn: api.datasets.create,
    onSuccess: (data) => {
      onCreate?.(data);
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
