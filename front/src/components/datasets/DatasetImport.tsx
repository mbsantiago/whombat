import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { type Dataset } from "@/api/schemas";
import api from "@/app/api";
import { UploadIcon } from "@/components/icons";
import { Input, InputGroup, Submit } from "@/components/inputs/index";

/**
 * Component for importing a dataset.
 *
 * @param onCreate - Callback function triggered when the dataset is
 * successfully imported.
 * @returns JSX element containing a form for importing a dataset.
 */
export default function DatasetImport({
  onCreate,
}: {
  onCreate?: (dataset: Dataset) => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const { mutateAsync: importDataset } = useMutation({
    mutationFn: api.datasets.import,
    onError: (error: AxiosError) => {
      if (error.response?.status === 422) {
        // @ts-ignore
        error.response.data.detail.forEach((error: any) => {
          setError(error.loc[1], { message: error.msg });
        });
      }
    },
    onSuccess: (dataset) => {
      onCreate?.(dataset);
    },
  });

  // @ts-ignore
  const onSubmit = async (data) => {
    const formData = new FormData();
    const file = data.dataset[0];
    formData.append("dataset", file);
    formData.append("audio_dir", data.audio_dir);

    return await toast.promise(importDataset(formData), {
      loading: "Importing dataset...",
      success: "Dataset imported successfully!",
      error: "Failed to import dataset.",
    });
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <InputGroup
        name="dataset"
        label="Select a dataset file to import"
        help="The file must be in AOEF format"
        // @ts-ignore
        error={errors.file?.message}
      >
        <Input type="file" {...register("dataset")} required />
      </InputGroup>
      <InputGroup
        name="audio_dir"
        label="Audio directory"
        help="Folder where all the dataset recordings are stored"
        // @ts-ignore
        error={errors.audio_dir?.message}
      >
        <Input
          {...register("audio_dir")}
          placeholder="Path to audio directory..."
          required
        />
      </InputGroup>

      <Submit>
        <UploadIcon className="inline-block mr-2 w-6 h-6 align-middle" />
        Import
      </Submit>
    </form>
  );
}
