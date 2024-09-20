import { z } from "zod";
import { TagSchema } from "./tags";

export const PREDICTION_TYPES = [
  "Clip Classification",
  "Clip Tagging",
  "Sound Event Detection",
  "Sound Event Tagging",
] as const;

export const EvaluationSetSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string().nullish(),
  task: z.enum(PREDICTION_TYPES),
  tags: z.array(TagSchema).nullish(),
  created_on: z.coerce.date(),
});
