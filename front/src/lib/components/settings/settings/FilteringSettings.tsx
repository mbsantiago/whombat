import { useCallback, useMemo } from "react";
import { type Control, useController } from "react-hook-form";

import { Group } from "@/lib/components/inputs";
import RangeSlider from "@/lib/components/inputs/RangeSlider";

import type { AudioSettings } from "@/lib/types";

import SettingsSection from "./SettingsSection";

export default function FilteringSettings({
  samplerate,
  control,
}: {
  samplerate: number;
  control: Control<AudioSettings>;
}) {
  const {
    field: { value: lowFreq, onChange: onChangeLowFreq },
    fieldState: { error: lowFreqError },
  } = useController({
    control,
    name: "low_freq",
  });

  const {
    field: { value: highFreq, onChange: onChangeHighFreq },
    fieldState: { error: highFreqError },
  } = useController({
    control,
    name: "high_freq",
  });

  const {
    field: { value: resample },
  } = useController({
    control,
    name: "resample",
  });

  const {
    field: { value: targetSamplerate },
  } = useController({
    control,
    name: "samplerate",
  });

  const maxFreq = useMemo(() => {
    if (resample && targetSamplerate != null) {
      return targetSamplerate / 2;
    }
    return samplerate / 2;
  }, [samplerate, resample, targetSamplerate]);

  const onChangeFreqs = useCallback(
    (val: number[] | number) => {
      const [low, high] = val as number[];
      if (low == 0) {
        onChangeLowFreq(null);
      } else {
        onChangeLowFreq(low ?? 0);
      }
      if (high == maxFreq) {
        onChangeHighFreq(null);
      } else {
        onChangeHighFreq(high ?? maxFreq);
      }
    },
    [onChangeLowFreq, onChangeHighFreq, maxFreq],
  );

  return (
    <SettingsSection>
      <Group
        name="filtering"
        label="Filtering"
        help="Select the range of frequencies to keep in the spectrogram."
        error={lowFreqError?.message || highFreqError?.message}
      >
        <RangeSlider
          label="Filtering"
          minValue={0}
          maxValue={maxFreq}
          step={10}
          value={[lowFreq ?? 0, highFreq ?? maxFreq]}
          onChange={onChangeFreqs}
        />
      </Group>
    </SettingsSection>
  );
}
