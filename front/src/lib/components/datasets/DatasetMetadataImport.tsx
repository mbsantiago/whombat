import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { UploadIcon } from "@/lib/components/icons";
import { Input, InputGroup, Submit } from "@/lib/components/inputs/index";

const DatasetImportSchema = z.object({
  dataset: z.instanceof(FileList),
  audio_dir: z.string().optional(),
});

type DatasetImport = z.infer<typeof DatasetImportSchema>;

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
      <InputGroup
        name="dataset"
        label="Select a dataset file to import"
        help="The file must be in AOEF format"
        error={errors.dataset?.message}
      >
        <Input
          type="file"
          {...register("dataset")}
          required
          multiple={false}
          accept="application/json"
        />
      </InputGroup>
      <InputGroup
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
      </InputGroup>
      <Submit>
        <UploadIcon className="inline-block mr-2 w-6 h-6 align-middle" />
        Import
      </Submit>
    </form>
  );
}
