import { type Control, Controller } from "react-hook-form";

import { InputGroup } from "@/components/inputs/index";
import Select from "@/components/inputs/Select";
import Toggle from "@/components/inputs/Toggle";

import SettingsSection from "./SettingsSection";

import type { SpectrogramParameters } from "@/types";

const AMPLITUDE_SCALES: Record<
  string,
  { id: string; value: string; label: string }
> = {
  dB: { id: "dB", value: "dB", label: "decibels (dB)" },
  amplitude: { id: "amplitude", value: "amplitude", label: "amplitude" },
  power: { id: "power", value: "power", label: "power" },
};

export default function AmplitudeSettings({
  control,
}: {
  control: Control<SpectrogramParameters>;
}) {
  return (
    <SettingsSection>
      <Controller
        name="scale"
        control={control}
        render={({ field, fieldState }) => (
          <InputGroup
            name="scale"
            label="Amplitude Scale"
            help="Select the amplitude scale to use for the spectrogram."
            error={fieldState.error?.message}
          >
            <Select
              selected={AMPLITUDE_SCALES[field.value]}
              onChange={field.onChange}
              options={Object.values(AMPLITUDE_SCALES)}
            />
          </InputGroup>
        )}
      />
      <Controller
        name="normalize"
        control={control}
        render={({ field, fieldState }) => (
          <InputGroup
            name="normalize"
            label="Normalize Amplitudes"
            help="Toggle to normalize amplitude values."
            error={fieldState.error?.message}
          >
            <Toggle
              label="Normalize"
              isSelected={field.value}
              onChange={field.onChange}
            />
          </InputGroup>
        )}
      />
    </SettingsSection>
  );
}
