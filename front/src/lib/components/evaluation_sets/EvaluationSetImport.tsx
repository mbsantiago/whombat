import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";

import { UploadIcon } from "@/lib/components/icons";
import { Group, Input, Submit } from "@/lib/components/inputs/index";

import { EvaluationSetImportSchema } from "@/lib/schemas";
import { EvaluationSetImport } from "@/lib/types";

import PredictionTypeSelect from "./PredictionTypeSelect";

export default function EvaluationSetImportComponent({
  onImportEvaluationSet,
}: {
  onImportEvaluationSet?: (data: EvaluationSetImport) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EvaluationSetImport>({
    mode: "onChange",
    resolver: zodResolver(EvaluationSetImportSchema),
  });

  const handleOnImport = useCallback(
    (data: EvaluationSetImport) => onImportEvaluationSet?.(data),
    [onImportEvaluationSet],
  );

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(handleOnImport)}
    >
      <Group
        name="evaluation_set"
        label="Select an Evaluation Set file to import"
        help="The file must be in AOEF format"
        error={errors.evaluation_set?.message?.toString()}
      >
        <Input type="file" {...register("evaluation_set")} required />
      </Group>
      <Group
        name="predictionType"
        label="Select the prediction type to evaluate"
        help="Choose the type of task or objective you want to evaluate."
        error={errors.task?.message}
      >
        <Controller
          control={control}
          name="task"
          render={({ field }) => (
            <PredictionTypeSelect
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              disabled={field.disabled}
            />
          )}
        />
      </Group>
      <Submit>
        <UploadIcon className="inline-block mr-2 w-6 h-6 align-middle" />
        Import
      </Submit>
    </form>
  );
}
