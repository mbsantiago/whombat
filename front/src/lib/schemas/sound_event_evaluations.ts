import { z } from "zod";
import { SoundEventAnnotationSchema } from "./sound_event_annotations";
import { SoundEventPredictionSchema } from "./sound_event_predictions";
import { FeatureSchema } from "./features";

export const SoundEventEvaluationSchema = z.object({
  uuid: z.string().uuid(),
  source: SoundEventPredictionSchema.nullish(),
  target: SoundEventAnnotationSchema.nullish(),
  affinity: z.number(),
  score: z.number(),
  metrics: z.array(FeatureSchema).nullish(),
  created_on: z.coerce.date(),
});
