import { useCallback } from "react";
import { type Control, useController } from "react-hook-form";

import { InputGroup } from "@/components/inputs";
import RangeSlider from "@/components/inputs/RangeSlider";

import SettingsSection from "./SettingsSection";

import type { SpectrogramParameters } from "@/types";
import type { ParameterConstraints } from "@/utils/spectrogram_parameters";

export default function FilteringSettings({
  constraints,
  control,
}: {
  constraints: ParameterConstraints;
  control: Control<SpectrogramParameters>;
}) {
  const lowFreq = useController({
    control,
    name: "low_freq",
  });

  const highFreq = useController({
    control,
    name: "high_freq",
  });

  const { onChange: onChangeLowFreq } = lowFreq.field;
  const { onChange: onChangeHighFreq } = highFreq.field;
  const onChangeFreqs = useCallback(
    (val: number[] | number) => {
      const [low, high] = val as number[];
      if (low == constraints.frequencyRange.min) {
        onChangeLowFreq(null);
      } else {
        onChangeLowFreq(low ?? constraints.frequencyRange.min);
      }
      if (high == constraints.frequencyRange.max) {
        onChangeHighFreq(null);
      } else {
        onChangeHighFreq(high ?? constraints.frequencyRange.max);
      }
    },
    [
      onChangeLowFreq,
      onChangeHighFreq,
      constraints.frequencyRange.min,
      constraints.frequencyRange.max,
    ],
  );

  return (
    <SettingsSection>
      <InputGroup
        name="filtering"
        label="Filtering"
        help="Select the range of frequencies to keep in the spectrogram."
      >
        <RangeSlider
          label="Filtering"
          minValue={constraints.frequencyRange.min}
          maxValue={constraints.frequencyRange.max}
          step={10}
          value={[
            lowFreq.field.value ?? constraints.frequencyRange.min,
            highFreq.field.value ?? constraints.frequencyRange.max,
          ]}
          onChange={onChangeFreqs}
        />
      </InputGroup>
    </SettingsSection>
  );
}
