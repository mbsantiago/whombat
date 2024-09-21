import api from "@/app/api";
import { UploadIcon } from "@/lib/components/icons";
import { Input, InputGroup, Submit } from "@/lib/components/inputs/index";
import type { ModelRun } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

export default function ModelRunImport({
  onCreate,
}: {
  onCreate?: (data: Promise<ModelRun>) => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const { mutateAsync: importModelRun } = useMutation<
    ModelRun,
    AxiosError,
    FormData
  >({
    mutationFn: api.modelRuns.import,
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
      const file = data.model_run[0];
      formData.append("model_run", file);
      const promise = importModelRun(formData);
      onCreate?.(promise);
    },
    [importModelRun, onCreate],
  );

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <InputGroup
        name="model_run"
        label="Select an Model Run file to import"
        help="The file must be in AOEF format"
        // @ts-ignore
        error={errors.file?.message}
      >
        <Input type="file" {...register("model_run")} required />
      </InputGroup>
      <Submit>
        <UploadIcon className="inline-block h-6 w-6 align-middle mr-2" />
        Import
      </Submit>
    </form>
  );
}
