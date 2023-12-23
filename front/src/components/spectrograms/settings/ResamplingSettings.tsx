import { type Control, useController, Controller } from "react-hook-form";
import {
  MIN_SAMPLERATE,
  MAX_SAMPLERATE,
  type SpectrogramParameters,
} from "@/api/spectrograms";
import { Input, InputGroup } from "@/components/inputs/index";
import Toggle from "@/components/inputs/Toggle";
import SettingsSection from "./SettingsSection";

export default function ResamplingSettings({
  control,
}: {
  control: Control<SpectrogramParameters>;
}) {
  const resample = useController({
    name: "resample",
    control,
  });

  return (
    <SettingsSection>
      <InputGroup
        name="resample"
        label="Resampling"
        help={
          resample.field.value
            ? "Uncheck to disable resampling."
            : "Audio is not being resampled. Check to enable resampling."
        }
      >
        <Toggle
          label="Resample"
          isSelected={resample.field.value ?? false}
          onChange={resample.field.onChange}
        />
      </InputGroup>
      {resample.field.value && (
        <Controller
          name="samplerate"
          control={control}
          render={({ field, fieldState }) => (
            <InputGroup
              name="resampleRate"
              label="Target rate"
              help="Select the sampling rate you want to resample to, in Hertz."
              error={fieldState.error?.message}
            >
              <Input
                type="number"
                {...field}
                max={MAX_SAMPLERATE}
                min={MIN_SAMPLERATE}
              />
            </InputGroup>
          )}
        />
      )}
    </SettingsSection>
  );
}
