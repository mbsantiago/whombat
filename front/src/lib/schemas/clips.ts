import { z } from "zod";

import { RecordingSchema } from "./recordings";
import { FeatureSchema } from "./features";

export const ClipSchema = z.object({
  uuid: z.string().uuid(),
  start_time: z.number(),
  end_time: z.number(),
  recording: RecordingSchema,
  features: z.array(FeatureSchema).nullish(),
  created_on: z.coerce.date(),
});
