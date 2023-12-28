import { type Control, Controller } from "react-hook-form";

import { InputGroup } from "@/components/inputs/index";
import Select from "@/components/inputs/Select";

import SettingsSection from "./SettingsSection";

import type { SpectrogramParameters } from "@/types";

const SPECTROGRAM_COLORMAPS: Record<
  string,
  {
    id: string;
    value: string;
    label: string;
  }
> = {
  gray: { id: "gray", value: "gray", label: "Gray" },
  viridis: { id: "viridis", value: "viridis", label: "Viridis" },
  magma: { id: "magma", value: "magma", label: "Magma" },
  inferno: { id: "inferno", value: "inferno", label: "Inferno" },
  plasma: { id: "plasma", value: "plasma", label: "Plasma" },
  cividis: { id: "cividis", value: "cividis", label: "Cividis" },
  cool: { id: "cool", value: "cool", label: "Cool" },
  cubehelix: { id: "cubehelix", value: "cubehelix", label: "Cubehelix" },
  twilight: { id: "twilight", value: "twilight", label: "Twilight" },
};

export default function ColorSettings({
  control,
}: {
  control: Control<SpectrogramParameters>;
}) {
  return (
    <SettingsSection>
      <Controller
        name="cmap"
        control={control}
        render={({ field, fieldState }) => (
          <InputGroup
            name="colorMap"
            label="Color map"
            help="Select the color map to use for the spectrogram."
            error={fieldState.error?.message}
          >
            <Select
              selected={SPECTROGRAM_COLORMAPS[field.value]}
              onChange={(colormap) => field.onChange(colormap)}
              options={Object.values(SPECTROGRAM_COLORMAPS)}
            />
          </InputGroup>
        )}
      />
    </SettingsSection>
  );
}
