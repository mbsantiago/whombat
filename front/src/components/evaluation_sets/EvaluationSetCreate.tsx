import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

import {
  type EvaluationSetCreate,
  EvaluationSetCreateSchema,
} from "@/api/evaluation_sets";
import api from "@/app/api";
import { Input, InputGroup, Submit, TextArea } from "@/components/inputs/index";

import type { EvaluationSet } from "@/types";
import type { AxiosError } from "axios";

export default function EvaluationSetCreate({
  onCreate,
  onError,
}: {
  onCreate?: (data: Promise<EvaluationSet>) => void;
  onError?: (error: AxiosError) => void;
}) {
  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm<EvaluationSet>({
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
      <Submit>Create Evaluation Set</Submit>
    </form>
  );
}
