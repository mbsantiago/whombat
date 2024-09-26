import { type Control, Controller } from "react-hook-form";

import Select from "@/lib/components/inputs/Select";
import Slider from "@/lib/components/inputs/Slider";
import { Group } from "@/lib/components/inputs/index";

import {
  MAX_FFT_SIZE,
  MAX_HOP_FRACTION,
  MIN_FFT_SIZE,
  MIN_HOP_FRACTION,
} from "@/lib/constants";
import type { SpectrogramSettings } from "@/lib/types";

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
  samplerate,
  control,
}: {
  samplerate: number;
  control: Control<SpectrogramSettings>;
}) {
  return (
    <SettingsSection>
      <Controller
        name="window_size"
        control={control}
        render={({ field, fieldState }) => (
          <Group
            name="windowSize"
            label="Window size"
            help="Select the size of the window used for the STFT, in seconds."
            error={fieldState.error?.message}
          >
            <Slider
              label="Window size"
              value={field.value}
              onChange={field.onChange}
              minValue={MIN_FFT_SIZE / samplerate}
              maxValue={MAX_FFT_SIZE / samplerate}
              step={0.001}
            />
          </Group>
        )}
      />
      <Controller
        name="overlap"
        control={control}
        render={({ field, fieldState }) => (
          <Group
            name="overlap"
            label="Overlap"
            help="Select the fraction of window size to overlap between windows."
            error={fieldState.error?.message}
          >
            <Slider
              label="Overlap fraction"
              value={field.value}
              onChange={field.onChange}
              minValue={MIN_HOP_FRACTION}
              maxValue={MAX_HOP_FRACTION}
              step={0.01}
            />
          </Group>
        )}
      />
      <Controller
        name="window"
        control={control}
        render={({ field, fieldState }) => (
          <Group
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
          </Group>
        )}
      />
    </SettingsSection>
  );
}
