import { z } from "zod";

import { FeatureSchema } from "./features";

export const EvaluationSchema = z.object({
  uuid: z.string().uuid(),
  task: z.string(),
  score: z.number(),
  metrics: z.array(FeatureSchema).nullish(),
  created_on: z.coerce.date(),
});

export const EvaluationCreateSchema = z.object({
  task: z.string(),
  score: z.number(),
});
