import { z } from "zod";
import { ClipAnnotationSchema } from "./clip_annotations";
import { ClipPredictionSchema } from "./clip_predictions";
import { SoundEventEvaluationSchema } from "./sound_event_evaluations";
import { FeatureSchema } from "./features";

export const ClipEvaluationSchema = z.object({
  uuid: z.string().uuid(),
  clip_annotation: ClipAnnotationSchema,
  clip_prediction: ClipPredictionSchema,
  sound_event_evaluations: z.array(SoundEventEvaluationSchema).nullish(),
  score: z.number(),
  metrics: z.array(FeatureSchema).nullish(),
  created_on: z.coerce.date(),
});
