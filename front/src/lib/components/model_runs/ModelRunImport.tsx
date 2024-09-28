import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

import { UploadIcon } from "@/lib/components/icons";
import { Group, Input, Submit } from "@/lib/components/inputs";

import { ModelRunImportSchema } from "@/lib/schemas";
import type { EvaluationSet, ModelRunImport } from "@/lib/types";

export default function ModelRunImport({
  evaluationSet,
  onImportModelRun,
}: {
  evaluationSet: EvaluationSet;
  onImportModelRun?: (data: ModelRunImport) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ModelRunImport>({
    resolver: zodResolver(ModelRunImportSchema),
    mode: "onChange",
    defaultValues: {
      evaluation_set_uuid: evaluationSet.uuid,
    },
  });

  const handleOnCreate = useCallback(
    (data: ModelRunImport) => {
      onImportModelRun?.(data);
    },
    [onImportModelRun],
  );

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(handleOnCreate)}
    >
      <Group
        name="model_run"
        label="Select an Model Run file to import"
        help="The file must be in AOEF format"
        error={errors.model_run?.message?.toString()}
      >
        <Input type="file" {...register("model_run")} required />
      </Group>
      <Submit>
        <UploadIcon className="inline-block mr-2 w-6 h-6 align-middle" />
        Import
      </Submit>
    </form>
  );
}
