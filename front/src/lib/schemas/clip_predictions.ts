import { z } from "zod";
import { ClipSchema } from "./clips";
import { PredictionTagSchema } from "./tags";
import { SoundEventPredictionSchema } from "./sound_event_predictions";

export const ClipPredictionSchema = z.object({
  uuid: z.string().uuid(),
  clip: ClipSchema,
  tags: z.array(PredictionTagSchema).nullish(),
  sound_events: z.array(SoundEventPredictionSchema).nullish(),
  created_on: z.coerce.date(),
});
