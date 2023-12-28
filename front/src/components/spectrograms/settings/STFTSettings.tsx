import { type Control, Controller } from "react-hook-form";

import { type SpectrogramParameters } from "@/api/spectrograms";
import { InputGroup } from "@/components/inputs/index";
import Select from "@/components/inputs/Select";
import Slider from "@/components/inputs/Slider";
import { type ParameterConstraints } from "@/utils/spectrogram_parameters";

import SettingsSection from "./SettingsSection";

const SPECTROGRAM_WINDOWS: Record<
  string,
  {
    id: string;
    value: string;
    label: string;
  }
> = {
  hann: { id: "hann", value: "hann", label: "Hann" },
  hamming: { id: "hamming", value: "hamming", label: "Hamming" },
  boxcar: { id: "boxcar", value: "boxcar", label: "Boxcar" },
  triang: { id: "triang", value: "triang", label: "Triangular" },
  blackman: { id: "blackman", value: "blackman", label: "Blackman" },
  bartlett: { id: "bartlett", value: "bartlett", label: "Bartlett" },
  flattop: { id: "flattop", value: "flattop", label: "Flat top" },
  parzen: { id: "parzen", value: "parzen", label: "Parzen" },
  bohman: { id: "bohman", value: "bohman", label: "Bohman" },
  blackmanharris: {
    id: "blackmanharris",
    value: "blackmanharris",
    label: "Blackman-Harris",
  },
  nuttall: { id: "nuttall", value: "nuttall", label: "Nuttall" },
  barthann: { id: "barthann", value: "barthann", label: "Bartlett-Hann" },
};

export default function STFTSettings({
  constraints,
  control,
}: {
  constraints: ParameterConstraints;
  control: Control<SpectrogramParameters>;
}) {
  return (
    <SettingsSection>
      <Controller
        name="window_size"
        control={control}
        render={({ field, fieldState }) => (
          <InputGroup
            name="windowSize"
            label="Window size"
            help="Select the size of the window used for the STFT, in seconds."
            error={fieldState.error?.message}
          >
            <Slider
              label="Window size"
              value={field.value}
              onChange={field.onChange}
              minValue={constraints.windowSize.min}
              maxValue={constraints.windowSize.max}
              step={0.001}
            />
          </InputGroup>
        )}
      />
      <Controller
        name="hop_size"
        control={control}
        render={({ field, fieldState }) => (
          <InputGroup
            name="hopSize"
            label="Hop size"
            help="Select the fraction of window size to use for the hop size."
            error={fieldState.error?.message}
          >
            <Slider
              label="Hop size"
              value={field.value}
              onChange={field.onChange}
              minValue={constraints.hopSize.min}
              maxValue={constraints.hopSize.max}
              step={0.05}
            />
          </InputGroup>
        )}
      />
      <Controller
        name="window"
        control={control}
        render={({ field, fieldState }) => (
          <InputGroup
            name="window"
            label="Window"
            help="Select the window function to use for the STFT."
            error={fieldState.error?.message}
          >
            <Select
              selected={SPECTROGRAM_WINDOWS[field.value]}
              onChange={field.onChange}
              options={Object.values(SPECTROGRAM_WINDOWS)}
            />
          </InputGroup>
        )}
      />
    </SettingsSection>
  );
}
