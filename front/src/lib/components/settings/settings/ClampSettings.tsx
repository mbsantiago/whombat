import { useController } from "react-hook-form";

import { Group } from "@/lib/components/inputs/index";
import RangeSlider from "@/lib/components/inputs/RangeSlider";
import { DEFAULT_SPECTROGRAM_SETTINGS, MIN_DB } from "@/lib/constants";
import type { SpectrogramSettingsControl } from "@/lib/types";

import SettingsSection from "./SettingsSection";

export default function ClampSettings({
  control,
}: {
  control: SpectrogramSettingsControl;
}) {
  const minDB = useController({
    control,
    name: "min_dB",
  });

  const maxDB = useController({
    control,
    name: "max_dB",
  });

  return (
    <SettingsSection>
      <Group
        name="clampValues"
        label="Min and Max Amplitude values"
        help="Select the min and max amplitude values to clamp to."
        error={
          minDB.fieldState.error?.message || maxDB.fieldState.error?.message
        }
      >
        <RangeSlider
          label="Filtering"
          minValue={MIN_DB}
          maxValue={0}
          step={2}
          value={[
            minDB.field.value ?? DEFAULT_SPECTROGRAM_SETTINGS.min_dB,
            maxDB.field.value ?? DEFAULT_SPECTROGRAM_SETTINGS.max_dB,
          ]}
          onChange={(value) => {
            const [min, max] = value as number[];
            minDB.field.onChange(min);
            maxDB.field.onChange(max);
          }}
        />
      </Group>
    </SettingsSection>
  );
}
