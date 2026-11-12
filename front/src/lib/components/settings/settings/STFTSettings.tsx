import { Controller } from "react-hook-form";

import { Group } from "@/lib/components/inputs/index";
import LogSlider from "@/lib/components/inputs/LogSlider";
import Select from "@/lib/components/inputs/Select";
import Slider from "@/lib/components/inputs/Slider";
import {
  DEFAULT_SPECTROGRAM_SETTINGS,
  MAX_HOP_FRACTION,
  MIN_HOP_FRACTION,
} from "@/lib/constants";
import type { SpectrogramSettingsControl } from "@/lib/types";

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

function WindowSize({
  control,
  samplerate,
}: {
  control: SpectrogramSettingsControl;
  samplerate: number;
}) {
  return (
    <Controller
      name="window_size"
      control={control}
      render={({ field, fieldState }) => (
        <Group
          name="windowSize"
          label="Window size"
          help="Select the size of the window used for the STFT, in seconds. The slider is logarithmic."
          error={fieldState.error?.message}
        >
          <LogSlider
            formatter={(value) => {
              let samples = Math.round(Math.pow(2, value));
              let seconds = samples / samplerate;
              return `${seconds.toFixed(6)} seconds (${samples} samples)`;
            }}
            base={2}
            label="Window size"
            defaultValue={Math.log2(
              (field.value ?? DEFAULT_SPECTROGRAM_SETTINGS.window_size) *
                samplerate,
            )}
            onChangeEnd={(value) => {
              if (typeof value !== "number") {
                let seconds = value.map((v) => v / samplerate);
                field.onChange(seconds);
                return;
              }

              let seconds = value / samplerate;
              field.onChange(seconds);
            }}
            minValue={4}
            maxValue={13}
            step={0.2}
          />
        </Group>
      )}
    />
  );
}

export default function STFTSettings({
  samplerate,
  control,
}: {
  samplerate: number;
  control: SpectrogramSettingsControl;
}) {
  return (
    <SettingsSection>
      <WindowSize control={control} samplerate={samplerate} />
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
              onChangeEnd={field.onChange}
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
              selected={
                SPECTROGRAM_WINDOWS[
                  field.value ?? DEFAULT_SPECTROGRAM_SETTINGS.window
                ]
              }
              onChange={field.onChange}
              options={Object.values(SPECTROGRAM_WINDOWS)}
            />
          </Group>
        )}
      />
    </SettingsSection>
  );
}
