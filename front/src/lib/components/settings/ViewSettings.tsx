import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { type Control, useController, useForm } from "react-hook-form";

import { Group, RangeSlider, Slider } from "@/lib/components/inputs";
import SettingsSection from "@/lib/components/settings/settings/SettingsSection";
import { ViewSettingsSchema } from "@/lib/schemas";
import type { ViewSettings } from "@/lib/types";
import { debounce } from "@/lib/utils/debounce";

import { InputHelp } from "../inputs/InputGroup";

interface ViewSettingsProps {
  settings: ViewSettings;
  samplerate: number;
  onChange?: (settings: ViewSettings) => void;
  debounceTime?: number;
}

export default function ViewSettings({
  settings,
  samplerate,
  onChange,
  debounceTime = 300,
}: ViewSettingsProps) {
  const { handleSubmit, watch, control } = useForm({
    resolver: zodResolver(ViewSettingsSchema),
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
      <SettingsSection>
        <div className="mb-2 text-sm text-stone-600 dark:text-stone-400">
          Set the default spectrogram view. Changes won’t affect the current
          spectrogram, only newly displayed ones.
        </div>
        <MinMaxFreqSettings control={control} samplerate={samplerate} />
        <DurationSettings control={control} />
      </SettingsSection>
    </div>
  );
}

function MinMaxFreqSettings({
  control,
  samplerate,
}: {
  control: Control<ViewSettings>;
  samplerate: number;
}) {
  const minFreq = useController({
    control,
    name: "min_freq",
  });

  const maxFreq = useController({
    control,
    name: "max_freq",
  });

  return (
    <Group
      name="clampValues"
      label="Frequency Range"
      help="Set the default frequency range to display (in Hz). You can always zoom in or out to adjust the view later."
      error={
        minFreq.fieldState.error?.message || maxFreq.fieldState.error?.message
      }
    >
      <RangeSlider
        label="Frequency Range"
        minValue={0}
        maxValue={samplerate / 2}
        step={2}
        value={[
          minFreq.field.value || 0,
          maxFreq.field.value || samplerate / 2,
        ]}
        onChange={(value) => {
          const [min, max] = value as number[];
          minFreq.field.onChange(min);
          maxFreq.field.onChange(max);
        }}
      />
    </Group>
  );
}

function DurationSettings({ control }: { control: Control<ViewSettings> }) {
  const duration = useController({
    control,
    name: "duration",
  });

  return (
    <Group
      name="duration"
      label="Duration"
      help="Set the default duration to display (in seconds). You can always zoom in or out to adjust the view later."
      error={duration.fieldState.error?.message}
    >
      <Slider
        label="Duration"
        minValue={0}
        maxValue={10}
        step={0.1}
        value={duration.field.value}
        onChange={(value) => duration.field.onChange(value)}
      />
    </Group>
  );
}
