import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

import { UploadIcon } from "@/lib/components/icons";
import { Group, Input, Submit } from "@/lib/components/inputs/index";

import { DatasetImportSchema } from "@/lib/schemas";
import type { DatasetImport } from "@/lib/types";

/**
 * Component for importing a dataset.
 *
 * @param onCreate - Callback function triggered when the dataset is
 * successfully imported.
 * @returns JSX element containing a form for importing a dataset.
 */
export default function DatasetImport({
  onImportDataset,
}: {
  onImportDataset?: (dataset: DatasetImport) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatasetImport>({
    resolver: zodResolver(DatasetImportSchema),
    mode: "onChange",
  });

  const handleOnCreate = useCallback(
    (data: DatasetImport) => {
      onImportDataset?.(data);
    },
    [onImportDataset],
  );

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(handleOnCreate)}
    >
      <Group
        name="dataset"
        label="Select a dataset file to import"
        help="The file must be in AOEF format"
        error={errors.dataset?.message?.toString()}
      >
        <Input
          type="file"
          {...register("dataset")}
          required
          multiple={false}
          accept="application/json"
        />
      </Group>
      <Group
        name="audio_dir"
        label="Audio directory"
        help="Folder where all the dataset recordings are stored"
        error={errors.audio_dir?.message}
      >
        <Input
          {...register("audio_dir")}
          placeholder="Path to audio directory..."
          required
        />
      </Group>
      <Submit>
        <UploadIcon className="inline-block mr-2 w-6 h-6 align-middle" />
        Import
      </Submit>
    </form>
  );
}
