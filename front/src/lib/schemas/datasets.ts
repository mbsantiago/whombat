import { z } from "zod";

export const DatasetSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  audio_dir: z.string(),
  description: z.string(),
  recording_count: z.number().int().default(0),
  created_on: z.coerce.date(),
});
