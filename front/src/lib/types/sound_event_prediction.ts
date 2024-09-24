import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type SoundEventPrediction = z.infer<
  typeof schemas.SoundEventPredictionSchema
>;

export type SoundEventPredictionCreate = z.infer<
  typeof schemas.SoundEventPredictionCreateSchema
>;

export type SoundEventPredictionUpdate = z.infer<
  typeof schemas.SoundEventPredictionUpdateSchema
>;

export type SoundEventPredictionFilter = z.infer<
  typeof schemas.SoundEventPredictionFilterSchema
>;
