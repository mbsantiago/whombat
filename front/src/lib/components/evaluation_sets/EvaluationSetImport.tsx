import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { useForm, Controller } from "react-hook-form";

import api from "@/app/api";
import { UploadIcon } from "@/lib/components/icons";
import { Input, Select, InputGroup, Submit } from "@/lib/components/inputs/index";
import { EVALUATION_OPTIONS } from "@/lib/components/evaluation_sets/EvaluationSetCreate";

import type { EvaluationSet } from "@/lib/types";
import type { AxiosError } from "axios";

export default function EvaluationSetImport({
  onCreate,
}: {
  onCreate?: (data: Promise<EvaluationSet>) => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const { mutateAsync: importEvaluationSet } = useMutation<
    EvaluationSet,
    AxiosError,
    FormData
  >({
    mutationFn: api.evaluationSets.import,
    onError: (error) => {
      if (error.response?.status === 422) {
        // @ts-ignore
        error.response.data.detail.forEach((error: any) => {
          setError(error.loc[1], { message: error.msg });
        });
      }
    },
  });

  const onSubmit = useCallback(
    // @ts-ignore
    async (data) => {
      const formData = new FormData();
      const file = data.evaluation_set[0];
      const task = data.task;
      formData.append("evaluation_set", file);
      formData.append("task", task);
      const promise = importEvaluationSet(formData);
      onCreate?.(promise);
    },
    [importEvaluationSet, onCreate],
  );

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <InputGroup
        name="evaluation_set"
        label="Select an Evaluation Set file to import"
        help="The file must be in AOEF format"
        // @ts-ignore
        error={errors.file?.message}
      >
        <Input type="file" {...register("evaluation_set")} required />
      </InputGroup>
      <InputGroup
        name="task"
        label="Select which task to evaluate"
        help="Select the name of the particular Machine Learning task that you want to evaluate this model run on."
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
      <Submit>
        <UploadIcon className="inline-block h-6 w-6 align-middle mr-2" />
        Import
      </Submit>
    </form>
  );
}
