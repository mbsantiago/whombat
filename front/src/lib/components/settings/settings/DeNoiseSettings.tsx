import { type Control, Controller } from "react-hook-form";

import Toggle from "@/lib/components/inputs/Toggle";
import { Group } from "@/lib/components/inputs/index";

import type { SpectrogramSettings } from "@/lib/types";

import SettingsSection from "./SettingsSection";

export default function DeNoiseSettings({
  control,
}: {
  control: Control<SpectrogramSettings>;
}) {
  return (
    <SettingsSection>
      <Controller
        name="pcen"
        control={control}
        render={({ field, fieldState }) => (
          <Group
            name="denoise"
            label="De-noise"
            help={
              field.value
                ? "De-noising is being applied. Uncheck to disable de-noising."
                : "Check to apply PCEN de-noising."
            }
            error={fieldState.error?.message}
          >
            <Toggle
              label="De-noise"
              isSelected={field.value ?? false}
              onChange={(denoise) => field.onChange(denoise)}
            />
          </Group>
        )}
      />
    </SettingsSection>
  );
}
