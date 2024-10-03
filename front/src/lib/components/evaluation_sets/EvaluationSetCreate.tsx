import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";

import { Group, Input, Submit, TextArea } from "@/lib/components/inputs/index";

import { EvaluationSetCreateSchema } from "@/lib/schemas";
import type { EvaluationSetCreate } from "@/lib/types";

import PredictionTypeSelect from "./PredictionTypeSelect";

export default function EvaluationSetCreateComponent({
  onCreateEvaluationSet,
}: {
  onCreateEvaluationSet?: (data: EvaluationSetCreate) => void;
}) {
  const {
    handleSubmit,
    control,
    formState: { errors },
    register,
  } = useForm<EvaluationSetCreate>({
    resolver: zodResolver(EvaluationSetCreateSchema),
    mode: "onChange",
  });

  const submit = useCallback(
    (data: EvaluationSetCreate) => {
      onCreateEvaluationSet?.(data);
    },
    [onCreateEvaluationSet],
  );

  return (
    <form className="w-full" onSubmit={handleSubmit(submit)}>
      <Group
        label="Name"
        name="name"
        help="Give this evaluation set a descriptive name for easy reference."
        error={errors.name?.message}
      >
        <Input {...register("name")} />
      </Group>
      <Group
        label="Description"
        name="description"
        help="Briefly explain the goals and scope of this evaluation. What are you hoping to assess?"
        error={errors.description?.message}
      >
        <TextArea rows={6} {...register("description")} />
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
      <Submit>Create Evaluation Set</Submit>
    </form>
  );
}
