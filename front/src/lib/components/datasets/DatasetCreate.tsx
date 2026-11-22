import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";

import FolderPicker from "@/lib/components/inputs/FolderPicker";
import { Group, Input, Submit, TextArea } from "@/lib/components/inputs/index";
import { DatasetCreateSchema } from "@/lib/schemas";
import type {
  DatasetCreate,
  DatasetDirectory,
  DatasetDirectoryBrowse,
} from "@/lib/types";

/**
 * Component for creating a new dataset.
 */
export default function CreateDataset({
  onCreateDataset,
  browseDirectories,
  completeDirectories,
}: {
  onCreateDataset?: (dataset: DatasetCreate) => void;
  browseDirectories?: (path: string) => Promise<DatasetDirectoryBrowse>;
  completeDirectories?: (path: string) => Promise<DatasetDirectory[]>;
}) {
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DatasetCreate>({
    resolver: zodResolver(DatasetCreateSchema),
    mode: "onChange",
    defaultValues: {
      include_subfolders: true,
      tag_recordings_by_folder: false,
    },
  });
  const includeSubfolders = watch("include_subfolders");

  const onSubmit = useCallback(
    (data: DatasetCreate) => {
      onCreateDataset?.({
        ...data,
        // Without subfolders there is nothing to tag by folder.
        tag_recordings_by_folder:
          data.include_subfolders && data.tag_recordings_by_folder,
      });
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
        help="Pick the dataset audio root; nested subfolders are scanned."
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
                completeDirectories={completeDirectories}
              />
            )}
          />
        ) : (
          <Input {...register("audio_dir")} />
        )}
      </Group>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-0.5 accent-slate-800"
          {...register("include_subfolders")}
        />
        <span>
          Include subfolders
          <span className="block text-xs text-slate-600">
            Also register audio files found in nested folders.
          </span>
        </span>
      </label>
      <label
        className={`flex items-start gap-2 text-sm ${
          includeSubfolders ? "" : "opacity-50"
        }`}
      >
        <input
          type="checkbox"
          className="mt-0.5 accent-slate-800"
          disabled={!includeSubfolders}
          {...register("tag_recordings_by_folder")}
        />
        <span>
          Group recordings by folder
          <span className="block text-xs text-slate-600">
            Add folder names as tags when creating recordings.
          </span>
        </span>
      </label>
      <div className="mb-3">
        <Submit>Create Dataset</Submit>
      </div>
    </form>
  );
}
