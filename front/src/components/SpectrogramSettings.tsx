import { useState, useMemo, type ReactNode } from "react";
import classNames from "classnames";
import Toggle from "@/components/Toggle";
import Button from "@/components/Button";
import Tooltip from "@/components/Tooltip";
import Select from "@/components/Select";
import SlideOver from "@/components/SlideOver";
import RangeSlider from "@/components/RangeSlider";
import { InputGroup, Input } from "@/components/inputs";
import { SpectrogramSettingsIcon } from "@/components/icons";
import { type SpectrogramParameters, MIN_DB } from "@/api/spectrograms";
import * as ToggleGroup from "@radix-ui/react-toggle-group";

const SPECTROGRAM_COLORMAPS: Record<
  string,
  {
    id: string;
    value: string;
    label: string;
  }
> = {
  viridis: { id: "viridis", value: "viridis", label: "Viridis" },
  magma: { id: "magma", value: "magma", label: "Magma" },
  inferno: { id: "inferno", value: "inferno", label: "Inferno" },
  plasma: { id: "plasma", value: "plasma", label: "Plasma" },
  cividis: { id: "cividis", value: "cividis", label: "Cividis" },
  cool: { id: "cool", value: "cool", label: "Cool" },
  cubehelix: { id: "cubehelix", value: "cubehelix", label: "Cubehelix" },
  twilight: { id: "twilight", value: "twilight", label: "Twilight" },
};

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

function SettingsSection({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col max-w-md w-full gap-2 border rounded-md p-4 dark:border-stone-600">
      {children}
    </div>
  );
}

function ResamplingSettings({
  settings,
  onChange,
}: {
  settings: SpectrogramParameters;
  onChange?: (key: keyof SpectrogramParameters, value: any) => void;
}) {
  return (
    <SettingsSection>
      <InputGroup
        name="resample"
        label="Resampling"
        help={
          settings.resample
            ? "Uncheck to disable resampling."
            : "Audio is not being resampled. Check to enable resampling."
        }
      >
        <Toggle
          label="Resample"
          checked={settings.resample ?? false}
          onChange={(resample) => onChange?.("resample", resample)}
        />
      </InputGroup>
      {settings.resample && (
        <InputGroup
          name="resampleRate"
          label="Target rate"
          help="Select the sampling rate you want to resample to, in Hertz."
        >
          <Input
            type="number"
            value={settings.samplerate ?? 44100}
            onChange={(e) => onChange?.("samplerate", parseInt(e.target.value))}
          />
        </InputGroup>
      )}
    </SettingsSection>
  );
}

function STFTSettings({
  settings,
  onChange,
}: {
  settings: SpectrogramParameters;
  onChange?: (key: keyof SpectrogramParameters, value: any) => void;
}) {
  const selectedWindow = useMemo(() => {
    return SPECTROGRAM_WINDOWS[settings.window ?? "hann"];
  }, [settings.window]);

  return (
    <SettingsSection>
      <InputGroup
        name="windowSize"
        label="Window size"
        help="Select the size of the window used for the STFT, in seconds."
      >
        <Input
          type="number"
          value={settings.window_size ?? 0.025}
          min={0.001}
          step={0.001}
          onChange={(e) =>
            onChange?.("window_size", parseFloat(e.target.value))
          }
        />
      </InputGroup>
      <InputGroup
        name="hopSize"
        label="Hop size"
        help="Select the size of the hop used for the STFT, in seconds."
      >
        <Input
          type="number"
          value={settings.hop_size ?? 0.01}
          min={0.001}
          step={0.001}
          onChange={(e) => onChange?.("hop_size", parseFloat(e.target.value))}
        />
      </InputGroup>
      <InputGroup
        name="window"
        label="Window"
        help="Select the window function to use for the STFT."
      >
        <Select
          selected={selectedWindow}
          onChange={(window) => onChange?.("window", window)}
          options={Object.values(SPECTROGRAM_WINDOWS)}
        />
      </InputGroup>
    </SettingsSection>
  );
}

function FilteringSettings({
  settings,
  onChange,
  onClear,
  nyquistFrequency,
}: {
  settings: SpectrogramParameters;
  onChange?: (key: keyof SpectrogramParameters, value: any) => void;
  onClear?: (key: keyof SpectrogramParameters) => void;
  nyquistFrequency: number;
}) {
  const initialFilterType =
    settings.low_freq == null && settings.high_freq == null
      ? ""
      : settings.low_freq != null && settings.high_freq != null
      ? "band"
      : settings.low_freq != null
      ? "low"
      : settings.high_freq != null
      ? "high"
      : "";

  const [filterType, setFilterType] = useState<string>(initialFilterType);

  const handleChange = (filterType: string) => {
    if (filterType === "") {
      onClear?.("low_freq");
      onClear?.("high_freq");
    } else if (filterType === "low") {
      onClear?.("low_freq");
      if (settings.high_freq == null) {
        onChange?.("high_freq", nyquistFrequency * 0.99);
      }
    } else if (filterType === "high") {
      onClear?.("high_freq");
      if (settings.low_freq == null) {
        onChange?.("low_freq", 1);
      }
    }
    setFilterType(filterType);
  };

  const slider = useMemo(() => {
    const maxValue =
      (settings.resample
        ? settings.samplerate ?? nyquistFrequency
        : nyquistFrequency) / 2;

    if (filterType === "band") {
      return (
        <RangeSlider
          key="band"
          defaultValue={[
            settings.low_freq ?? 1,
            settings.high_freq ?? maxValue * 0.99,
          ]}
          min={1}
          step={100}
          name="band"
          max={maxValue * 0.99}
          minStepsBetweenThumbs={5}
          minLabel="0 Hz"
          maxLabel={`${maxValue.toLocaleString()} Hz`}
          onValueCommit={(value) => {
            onChange?.("low_freq", value[0] ?? 1);
            onChange?.("high_freq", value[1] ?? maxValue * 0.99);
          }}
        />
      );
    }

    if (filterType === "high") {
      return (
        <RangeSlider
          key="high"
          defaultValue={[settings.low_freq ?? 1]}
          step={100}
          min={1}
          name="high"
          max={maxValue * 0.99}
          minLabel="0 Hz"
          maxLabel={`${maxValue.toLocaleString()} Hz`}
          inverted
          onValueCommit={(value) => {
            onChange?.("low_freq", value[0] ?? 1);
          }}
        />
      );
    }

    if (filterType === "low") {
      return (
        <RangeSlider
          key="low"
          defaultValue={[settings.high_freq ?? maxValue * 0.99]}
          step={100}
          min={1}
          name="low"
          minLabel="0 Hz"
          maxLabel={`${maxValue.toLocaleString()} Hz`}
          max={maxValue * 0.99}
          onValueCommit={(value) => {
            onChange?.("high_freq", value[0] ?? maxValue * 0.99);
          }}
        />
      );
    }

    return null;
  }, [settings, filterType, nyquistFrequency, onChange]);

  const filterTypes = [
    {
      value: "low",
      text: "Lowpass",
      label: "Low-pass filter",
    },
    {
      value: "high",
      text: "Highpass",
      label: "High-pass filter",
    },
    {
      value: "band",
      text: "Bandpass",
      label: "Band-pass filter",
    },
  ];

  const helpText =
    filterType === ""
      ? "No frequency filtering is being applied. Select a filter type to enable filtering."
      : filterType === "low"
      ? "Click again to disable. Only frequencies below the selected value will be kept."
      : filterType === "high"
      ? "Click again to disable. Only frequencies above the selected value will be kept."
      : "Click again to disable. Only frequencies between the selected values will be kept.";

  return (
    <SettingsSection>
      <InputGroup name="lowFreq" label="Filtering" help={helpText}>
        <ToggleGroup.Root
          type="single"
          className="divide-x divide-stone-300 dark:divide-stone-600"
          value={filterType}
          onValueChange={handleChange}
          aria-label="Filter type"
        >
          {filterTypes.map(({ value, text, label }, index) => (
            <ToggleGroup.Item
              key={value}
              className={classNames(
                "p-1 px-2",
                {
                  "rounded-s": index === 0,
                  "rounded-e": index === filterTypes.length - 1,
                  "bg-stone-200 dark:bg-stone-700 hover:bg-emerald-500":
                    filterType != value,
                  "bg-emerald-700 text-emerald-300 dark:bg-emerald-300 dark:text-emerald-700 dark:hover:bg-emerald-400 hover:bg-emerald-800":
                    filterType === value,
                },
                "focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500 focus-visible:ring-opacity-75",
              )}
              value={value}
              aria-label={label}
            >
              {text}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
      </InputGroup>
      {slider}
      {filterType != "" && (
        <InputGroup
          name="order"
          label="Order filter"
          help="Select the order of butterworth filter to use"
        >
          <Input
            type="number"
            value={settings.filter_order ?? 4}
            onChange={(e) =>
              onChange?.("filter_order", parseInt(e.target.value))
            }
            max={10}
            min={1}
          />
        </InputGroup>
      )}
    </SettingsSection>
  );
}

function ColorSettings({
  settings,
  onChange,
}: {
  settings: SpectrogramParameters;
  onChange?: (key: keyof SpectrogramParameters, value: any) => void;
}) {
  const selectedColormap = useMemo(() => {
    return (
      SPECTROGRAM_COLORMAPS[settings.cmap ?? "viridis"] ??
      SPECTROGRAM_COLORMAPS["viridis"]
    );
  }, [settings.cmap]);

  return (
    <SettingsSection>
      <InputGroup
        name="colorMap"
        label="Color map"
        help="Select the color map to use for the spectrogram."
      >
        <Select
          selected={selectedColormap}
          onChange={(colormap) => onChange?.("cmap", colormap)}
          options={Object.values(SPECTROGRAM_COLORMAPS)}
        />
      </InputGroup>
    </SettingsSection>
  );
}

function ClampSettings({
  settings,
  onChange,
}: {
  settings: SpectrogramParameters;
  onChange?: (key: keyof SpectrogramParameters, value: any) => void;
}) {
  return (
    <SettingsSection>
      <InputGroup
        name="Clamp"
        label="Clamp Amplitude"
        help={
          settings.clamp
            ? `Amplitude values are being clamped.
          Uncheck to disable clamping.`
            : `Amplitude values are not being clamped. 
          Check here to enable clamping.`
        }
      >
        <Toggle
          label="Clamp"
          checked={settings.clamp ?? false}
          onChange={(clamp) => onChange?.("clamp", clamp)}
        />
      </InputGroup>
      {settings.clamp && (
        <InputGroup
          name="clampValues"
          label="Min and Max amplitude values"
          help="Select the min and max amplitude values to clamp to."
        >
          <RangeSlider
            defaultValue={[settings.min_dB ?? MIN_DB, settings.max_dB ?? 0]}
            min={MIN_DB}
            max={0}
            step={1}
            minLabel={`${MIN_DB} dB`}
            maxLabel="0 dB"
            onValueCommit={(value) => {
              onChange?.("min_dB", value[0]);
              onChange?.("max_dB", value[1]);
            }}
          />
        </InputGroup>
      )}
    </SettingsSection>
  );
}

function DeNoiseSettings({
  settings,
  onChange,
}: {
  settings: SpectrogramParameters;
  onChange?: (key: keyof SpectrogramParameters, value: any) => void;
}) {
  return (
    <SettingsSection>
      <InputGroup
        name="denoise"
        label="De-noise"
        help={
          settings.pcen
            ? "De-noising is being applied. Uncheck to disable de-noising."
            : "Check to apply PCEN de-noising."
        }
      >
        <Toggle
          label="De-noise"
          checked={settings.pcen ?? false}
          onChange={(denoise) => onChange?.("pcen", denoise)}
        />
      </InputGroup>
    </SettingsSection>
  );
}

const AMPLITUDE_SCALES: Record<
  string,
  { id: string; value: string; label: string }
> = {
  dB: { id: "dB", value: "dB", label: "decibels (dB)" },
  amplitude: { id: "amplitude", value: "amplitude", label: "amplitude" },
  power: { id: "power", value: "power", label: "power" },
};

function AmplitudeSettings({
  settings,
  onChange,
}: {
  settings: SpectrogramParameters;
  onChange?: (key: keyof SpectrogramParameters, value: any) => void;
}) {
  const selectedScale = useMemo(() => {
    return AMPLITUDE_SCALES[settings.scale ?? "dB"];
  }, [settings.scale]);

  return (
    <SettingsSection>
      <InputGroup
        name="scale"
        label="Amplitude Scale"
        help="Select the amplitude scale to use for the spectrogram."
      >
        <Select
          selected={selectedScale}
          onChange={(scale) => onChange?.("scale", scale)}
          options={Object.values(AMPLITUDE_SCALES)}
        />
      </InputGroup>
      <InputGroup
        name="normalize"
        label="Normalize Amplitudes"
        help="Toggle to normalize amplitude values."
      >
        <Toggle
          label="Normalize"
          checked={settings.normalize ?? false}
          onChange={(normalize) => onChange?.("normalize", normalize)}
        />
      </InputGroup>
    </SettingsSection>
  );
}

function SpectrogramSettingMenu({
  settings,
  onChange,
  onClear,
  nyquistFrequency = 44100,
}: {
  settings: SpectrogramParameters;
  onChange?: (key: keyof SpectrogramParameters, value: any) => void;
  onClear?: (key: keyof SpectrogramParameters) => void;
  nyquistFrequency?: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <ResamplingSettings settings={settings} onChange={onChange} />
      <FilteringSettings
        nyquistFrequency={nyquistFrequency}
        settings={settings}
        onChange={onChange}
        onClear={onClear}
      />
      <STFTSettings settings={settings} onChange={onChange} />
      <DeNoiseSettings settings={settings} onChange={onChange} />
      <ColorSettings settings={settings} onChange={onChange} />
      <AmplitudeSettings settings={settings} onChange={onChange} />
      <ClampSettings settings={settings} onChange={onChange} />
    </div>
  );
}

export default function SpectrogramSettings({
  settings,
  onChange,
  onClear,
  nyquistFrequency = 44100,
}: {
  settings: SpectrogramParameters;
  onChange?: (key: keyof SpectrogramParameters, value: any) => void;
  onClear?: (key: keyof SpectrogramParameters) => void;
  nyquistFrequency?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Tooltip placement="bottom" tooltip="Spectrogram settings">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          <SpectrogramSettingsIcon className="w-5 h-5" />
        </Button>
      </Tooltip>
      <SlideOver
        title={
          <div className="flex flex-row items-center">
            <SpectrogramSettingsIcon className="w-5 h-5 mr-2 inline-block" />
            Settings
          </div>
        }
        isOpen={open}
        onClose={() => setOpen(false)}
      >
        <SpectrogramSettingMenu
          nyquistFrequency={nyquistFrequency}
          settings={settings}
          onChange={onChange}
          onClear={onClear}
        />
      </SlideOver>
    </div>
  );
}
