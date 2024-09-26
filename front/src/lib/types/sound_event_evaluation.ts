import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type SoundEventEvaluation = z.infer<
  typeof schemas.SoundEventEvaluationSchema
>;

export type SoundEventEvaluationFilter = z.infer<
  typeof schemas.SoundEventEvaluationFilterSchema
>;
