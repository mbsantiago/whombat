import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type ClipEvaluation = z.infer<typeof schemas.ClipEvaluationSchema>;

export type ClipEvaluationFilter = z.input<
  typeof schemas.ClipEvaluationFilterSchema
>;
