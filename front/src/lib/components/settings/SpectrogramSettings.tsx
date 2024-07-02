import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { debounce } from "@/lib/utils/debounce";

import AmplitudeSettings from "./settings/AmplitudeSettings";
import ClampSettings from "./settings/ClampSettings";
import ColorSettings from "./settings/ColorSettings";
import DeNoiseSettings from "./settings/DeNoiseSettings";
import STFTSettings from "./settings/STFTSettings";
import { SpectrogramSettingsSchema } from "@/schemas";

import type { SpectrogramSettings } from "@/lib/types";

export default function SpectrogramSettings({
  settings,
  samplerate,
  onChange,
  debounceTime = 300,
}: {
  settings: SpectrogramSettings;
  samplerate: number;
  onChange?: (parameters: SpectrogramSettings) => void;
  debounceTime?: number;
}) {
  const { handleSubmit, watch, control } = useForm({
    resolver: zodResolver(SpectrogramSettingsSchema),
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
      <STFTSettings samplerate={samplerate} control={control} />
      <DeNoiseSettings control={control} />
      <ColorSettings control={control} />
      <AmplitudeSettings control={control} />
      <ClampSettings control={control} />
    </div>
  );
}
