import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

import api from "@/app/api";
import { UploadIcon } from "@/components/icons";
import { Input, InputGroup, Submit } from "@/components/inputs/index";

import type { EvaluationSet } from "@/types";
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
      formData.append("evaluation_set", file);
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
      <Submit>
        <UploadIcon className="inline-block h-6 w-6 align-middle mr-2" />
        Import
      </Submit>
    </form>
  );
}
