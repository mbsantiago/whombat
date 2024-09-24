import { z } from "zod";

import { ClipSchema } from "./clips";
import { SoundEventPredictionSchema } from "./sound_event_predictions";
import { PredictionTagSchema } from "./tags";

export const ClipPredictionSchema = z.object({
  uuid: z.string().uuid(),
  clip: ClipSchema,
  tags: z.array(PredictionTagSchema).nullish(),
  sound_events: z.array(SoundEventPredictionSchema).nullish(),
  created_on: z.coerce.date(),
});

export const ClipPredictionCreateSchema = z.object({
  tags: z.array(PredictionTagSchema).optional(),
});
