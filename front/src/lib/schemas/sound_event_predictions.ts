import { z } from "zod";
import { PredictionTagSchema } from "./tags";
import { SoundEventSchema } from "./sound_events";

export const SoundEventPredictionSchema = z.object({
  uuid: z.string().uuid(),
  sound_event: SoundEventSchema,
  score: z.number(),
  tags: z.array(PredictionTagSchema).nullish(),
  created_on: z.coerce.date(),
});
