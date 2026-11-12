import { useEffect } from "react";
import type {
  FieldValues,
  SubmitHandler,
  UseFormHandleSubmit,
  UseFormWatch,
} from "react-hook-form";

import { debounce } from "@/lib/utils/debounce";

export default function useDebounceSubmit<
  TInput extends FieldValues,
  TOutput extends FieldValues,
>({
  watch,
  handleSubmit,
  onSubmit,
  value,
  timeout = 300,
}: {
  value?: TOutput;
  watch: UseFormWatch<TInput>;
  handleSubmit: UseFormHandleSubmit<TInput, TOutput>;
  onSubmit?: SubmitHandler<TOutput>;
  timeout?: number;
}) {
  useEffect(() => {
    const debouncedCb = debounce(
      handleSubmit((data) => {
        if (value != null && value == data) return;
        onSubmit?.(data);
      }),
      timeout,
    );
    const subscription = watch(debouncedCb);
    return () => subscription.unsubscribe();
  }, [watch, handleSubmit, onSubmit, timeout, value]);
}
