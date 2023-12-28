import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";

import Button from "@/components/Button";
import { SettingsIcon } from "@/components/icons";
import SlideOver from "@/components/SlideOver";
import Tooltip from "@/components/Tooltip";
import { SpectrogramParametersSchema } from "@/schemas";
import { debounce } from "@/utils/debounce";
import {
  computeConstraints,
  validateParameters,
} from "@/utils/spectrogram_parameters";

import AmplitudeSettings from "./settings/AmplitudeSettings";
import ClampSettings from "./settings/ClampSettings";
import ColorSettings from "./settings/ColorSettings";
import DeNoiseSettings from "./settings/DeNoiseSettings";
import FilteringSettings from "./settings/FilteringSettings";
import ResamplingSettings from "./settings/ResamplingSettings";
import STFTSettings from "./settings/STFTSettings";

import type { SpectrogramParameters } from "@/types";

export function SpectrogramSettingForm({
  settings,
  samplerate: recordingSamplerate,
  onChange,
}: {
  settings: SpectrogramParameters;
  samplerate: number;
  onChange?: (parameters: SpectrogramParameters) => void;
}) {
  const initialSettings = useMemo(() => {
    const constraints = computeConstraints(recordingSamplerate);
    return validateParameters(settings, constraints);
  }, [settings, recordingSamplerate]);

  // Create a custom resolver that will first validate the parameters
  // with respect to the constraints computed from the recording samplerate
  // and then validate the parameters with respect to the schema
  const resolver = useMemo<Resolver<SpectrogramParameters>>(() => {
    const schemaResolver = zodResolver(SpectrogramParametersSchema);
    return async (values, context, options) => {
      const { resample, samplerate } = values;
      const currentSamplerate = resample
        ? samplerate || recordingSamplerate
        : recordingSamplerate;
      const constraints = computeConstraints(currentSamplerate);
      const validated = validateParameters(values, constraints);
      return await schemaResolver(validated, context, options);
    };
  }, [recordingSamplerate]);

  const { handleSubmit, watch, control } = useForm({
    resolver,
    mode: "onBlur",
    reValidateMode: "onBlur",
    values: initialSettings,
  });

  const samplerate = watch("samplerate") as number;
  const constraints = useMemo(
    () => computeConstraints(samplerate),
    [samplerate],
  );

  // When the form is submitted, we debounce the callback to avoid
  // calling it too often
  useEffect(() => {
    const debouncedCb = debounce(
      handleSubmit((data) => {
        onChange?.(data);
      }),
      300,
    );
    const subscription = watch(debouncedCb);
    return () => subscription.unsubscribe();
  }, [watch, handleSubmit, onChange]);

  return (
    <div className="flex flex-col gap-2">
      <ResamplingSettings control={control} />
      <FilteringSettings constraints={constraints} control={control} />
      <STFTSettings constraints={constraints} control={control} />
      <DeNoiseSettings control={control} />
      <ColorSettings control={control} />
      <AmplitudeSettings control={control} />
      <ClampSettings control={control} />
    </div>
  );
}

export default function SpectrogramSettings({
  settings,
  samplerate,
  onChange,
  onReset,
  onSave,
}: {
  settings: SpectrogramParameters;
  samplerate: number;
  onChange?: (parameters: SpectrogramParameters) => void;
  onReset?: () => void;
  onSave?: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Tooltip placement="bottom" tooltip="Spectrogram settings">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          <SettingsIcon className="w-5 h-5" />
        </Button>
      </Tooltip>
      <SlideOver
        title={
          <div className="flex flex-row items-center justify-between">
            <span className="inline-flex items-center">
              <SettingsIcon className="inline-block mr-2 w-6 h-6" />
              Settings
            </span>
            <span className="inline-flex items-center gap-4">
              <Button mode="text" variant="warning" onClick={onReset}>
                Reset
              </Button>
              <Button mode="text" variant="primary" onClick={onSave}>
                Save
              </Button>
            </span>
          </div>
        }
        isOpen={open}
        onClose={() => setOpen(false)}
      >
        <SpectrogramSettingForm
          samplerate={samplerate}
          settings={settings}
          onChange={onChange}
        />
      </SlideOver>
    </div>
  );
}
