import { z } from "zod";

import { FeatureSchema } from "./features";
import { RecordingSchema } from "./recordings";

export const ClipSchema = z.object({
  uuid: z.string().uuid(),
  start_time: z.number(),
  end_time: z.number(),
  recording: RecordingSchema,
  features: z.array(FeatureSchema).nullish(),
  created_on: z.coerce.date(),
});
