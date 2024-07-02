import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { useForm, Controller } from "react-hook-form";

import {
  type EvaluationSetCreate,
  EvaluationSetCreateSchema,
} from "@/lib/api/evaluation_sets";
import api from "@/app/api";
import {
  Input,
  Select,
  InputGroup,
  Submit,
  TextArea,
} from "@/lib/components/inputs/index";

import type { Option } from "@/lib/components/inputs/Select";
import type { EvaluationSet } from "@/lib/types";
import type { AxiosError } from "axios";

export const EVALUATION_OPTIONS: Option<string>[] = [
  {
    id: "clip_classification",
    label: "Clip Classification",
    value: "clip_classification",
  },
  {
    id: "clip_multi_label_classification",
    label: "Clip Multi Label Classification",
    value: "clip_multi_label_classification",
  },
  {
    id: "sound_event_detection",
    label: "Sound Event Detection",
    value: "sound_event_detection",
  },
  {
    id: "sound_event_classification",
    label: "Sound Event Classification",
    value: "sound_event_classification",
  },
];

export default function EvaluationSetCreate({
  onCreate,
  onError,
}: {
  onCreate?: (data: Promise<EvaluationSet>) => void;
  onError?: (error: AxiosError) => void;
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

  const { mutateAsync: createEvaluationSet } = useMutation({
    mutationFn: api.evaluationSets.create,
    onError: onError,
  });

  const onSubmit = useCallback(
    async (data: EvaluationSetCreate) => {
      const promise = createEvaluationSet(data);
      onCreate?.(promise);
    },
    [createEvaluationSet, onCreate],
  );

  return (
    <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
      <InputGroup
        label="Name"
        name="name"
        help="Please provide a name this evaluation set."
        error={errors.name?.message}
      >
        <Input {...register("name")} />
      </InputGroup>
      <InputGroup
        label="Description"
        name="description"
        help="Describe the purpose of this evaluation set."
        error={errors.description?.message}
      >
        <TextArea rows={6} {...register("description")} />
      </InputGroup>
      <InputGroup
        name="task"
        label="Select which task to evaluate"
        help="Select the name of the particular Machine Learning task that you want to evaluate this model run on."
        error={errors.task?.message}
      >
        <Controller
          control={control}
          name="task"
          render={({ field }) => (
            <Select
              options={EVALUATION_OPTIONS}
              selected={
                EVALUATION_OPTIONS.find(
                  (option) => option.value === field.value,
                ) || EVALUATION_OPTIONS[0]
              }
              onChange={(value) => field.onChange(value)}
            />
          )}
        />
      </InputGroup>
      <Submit>Create Evaluation Set</Submit>
    </form>
  );
}
