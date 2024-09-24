import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type SpectrogramParameters = z.infer<
  typeof schemas.SpectrogramParametersSchema
>;

export type AudioSettings = z.infer<typeof schemas.AudioSettingsSchema>;

export type SpectrogramSettings = z.infer<
  typeof schemas.SpectrogramSettingsSchema
>;
