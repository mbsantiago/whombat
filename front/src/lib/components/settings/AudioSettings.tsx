import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { AudioSettingsSchema } from "@/lib/schemas";
import type { AudioSettings } from "@/lib/types";
import { debounce } from "@/lib/utils/debounce";

import FilteringSettings from "./settings/FilteringSettings";
import ResamplingSettings from "./settings/ResamplingSettings";

export default function AudioSettings({
  settings,
  samplerate,
  onChange,
  debounceTime = 300,
}: {
  settings: AudioSettings;
  samplerate: number;
  onChange?: (settings: AudioSettings) => void;
  debounceTime?: number;
}) {
  const { handleSubmit, watch, control } = useForm({
    resolver: zodResolver(AudioSettingsSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    values: settings,
  });

  useEffect(() => {
    const debouncedCb = debounce(
      handleSubmit((data) => {
        onChange?.(data);
      }),
      debounceTime,
    );
    const subscription = watch(debouncedCb);
    return () => subscription.unsubscribe();
  }, [watch, handleSubmit, onChange, debounceTime]);

  return (
    <div className="flex flex-col gap-2">
      <ResamplingSettings samplerate={samplerate} control={control} />
      <FilteringSettings samplerate={samplerate} control={control} />
    </div>
  );
}
