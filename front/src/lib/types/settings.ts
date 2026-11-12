import type { Control } from "react-hook-form";
import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type SpectrogramParameters = z.infer<
  typeof schemas.SpectrogramParametersSchema
>;

export type AudioSettingsInput = z.input<typeof schemas.AudioSettingsSchema>;
export type AudioSettings = z.output<typeof schemas.AudioSettingsSchema>;
export type AudioSettingsControl = Control<
  AudioSettingsInput,
  unknown,
  AudioSettings
>;

export type SpectrogramSettingsInput = z.input<
  typeof schemas.SpectrogramSettingsSchema
>;
export type SpectrogramSettings = z.output<
  typeof schemas.SpectrogramSettingsSchema
>;
export type SpectrogramSettingsControl = Control<
  SpectrogramSettingsInput,
  unknown,
  SpectrogramSettings
>;

export type ViewSettingsInput = z.input<typeof schemas.ViewSettingsSchema>;
export type ViewSettings = z.output<typeof schemas.ViewSettingsSchema>;
export type ViewSettingsControl = Control<
  ViewSettingsInput,
  unknown,
  ViewSettings
>;
