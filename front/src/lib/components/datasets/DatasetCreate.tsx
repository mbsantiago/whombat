import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";

import FolderPicker from "@/lib/components/inputs/FolderPicker";
import { Group, Input, Submit, TextArea } from "@/lib/components/inputs/index";
import { DatasetCreateSchema } from "@/lib/schemas";
import type { DatasetCreate, DatasetDirectoryBrowse } from "@/lib/types";

/**
 * Component for creating a new dataset.
 */
export default function CreateDataset({
  onCreateDataset,
  browseDirectories,
}: {
  onCreateDataset?: (dataset: DatasetCreate) => void;
  browseDirectories?: (path: string) => Promise<DatasetDirectoryBrowse>;
}) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatasetCreate>({
    resolver: zodResolver(DatasetCreateSchema),
    mode: "onChange",
  });

  const onSubmit = useCallback(
    (data: DatasetCreate) => {
      onCreateDataset?.(data);
    },
    [onCreateDataset],
  );

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <Group
        name="name"
        label="Name"
        help="Please provide a name for the dataset."
        error={errors.name?.message}
      >
        <Input {...register("name")} />
      </Group>
      <Group
        name="description"
        label="Description"
        help="Describe the dataset."
        error={errors.description?.message}
      >
        <TextArea {...register("description")} />
      </Group>
      <Group
        name="audio_dir"
        label="Audio Directory"
        help="Pick the folder where the dataset recordings reside."
        error={errors.audio_dir?.message}
      >
        {browseDirectories ? (
          <Controller
            control={control}
            name="audio_dir"
            render={({ field }) => (
              <FolderPicker
                value={field.value}
                onChange={field.onChange}
                browseDirectories={browseDirectories}
              />
            )}
          />
        ) : (
          <Input {...register("audio_dir")} />
        )}
      </Group>
      <div className="mb-3">
        <Submit>Create Dataset</Submit>
      </div>
    </form>
  );
}
