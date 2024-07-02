import { type Control, useController } from "react-hook-form";

import { InputGroup } from "@/components/inputs/index";
import RangeSlider from "@/components/inputs/RangeSlider";
import { MIN_DB } from "@/lib/constants";

import SettingsSection from "./SettingsSection";

import type { SpectrogramSettings } from "@/lib/types";

export default function ClampSettings({
  control,
}: {
  control: Control<SpectrogramSettings>;
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
      <InputGroup
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
          value={[minDB.field.value, maxDB.field.value]}
          onChange={(value) => {
            const [min, max] = value as number[];
            minDB.field.onChange(min);
            maxDB.field.onChange(max);
          }}
        />
      </InputGroup>
    </SettingsSection>
  );
}
