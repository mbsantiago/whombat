import { AxiosError } from "axios";
import api from "@/app/api";
import { useMutation } from "@tanstack/react-query";
import Empty from "@/components/Empty";
import type { ModelRun, EvaluationSet, Evaluation } from "@/types";
import { EvaluationIcon } from "@/components/icons";
import { Select, InputGroup, Submit } from "@/components/inputs";
import type { Option } from "@/components/inputs/Select";
import { useCallback } from "react";
import { useForm, Controller } from "react-hook-form";

const EVALUATION_OPTIONS: Option<string>[] = [
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

export default function ModelRunEvaluate(props: {
  modelRun: ModelRun;
  evaluationSet: EvaluationSet;
  onEvaluate?: (data: Promise<Evaluation>) => void;
}) {
  return <Empty>Coming soon!</Empty>;

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<{ task: string }>({
    mode: "onChange",
  });

  const onMutate = useCallback(
    ({ task }: { task: string }) => {
      return api.modelRuns.evaluate(props.modelRun, {
        task,
        evaluationSet: props.evaluationSet,
      });
    },
    [props.modelRun, props.evaluationSet],
  );

  const { mutateAsync: evaluateModelRun } = useMutation({
    mutationFn: onMutate,
    onError: (error: AxiosError) => {
      if (error.response?.status === 422) {
        // @ts-ignore
        error.response.data.detail.forEach((error: any) => {
          setError(error.loc[1], { message: error.msg });
        });
      }
    },
  });

  const { onEvaluate } = props;
  const onSubmit = useCallback(
    async (data: { task: string }) => {
      const promise = evaluateModelRun(data);
      onEvaluate?.(promise);
    },
    [evaluateModelRun, onEvaluate],
  );

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
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
      <Submit>
        <EvaluationIcon className="inline-block mr-2 w-6 h-6 align-middle" />
        Evaluate
      </Submit>
    </form>
  );
}
