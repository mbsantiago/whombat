import { useEffect } from "react";
import type {
  FieldValues,
  SubmitHandler,
  UseFormHandleSubmit,
  UseFormWatch,
} from "react-hook-form";

import { debounce } from "@/lib/utils/debounce";

export default function useDebounceSubmit<T extends FieldValues>({
  watch,
  handleSubmit,
  onSubmit,
  value,
  timeout = 300,
}: {
  value?: T;
  watch: UseFormWatch<T>;
  handleSubmit: UseFormHandleSubmit<T>;
  onSubmit?: SubmitHandler<T>;
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
