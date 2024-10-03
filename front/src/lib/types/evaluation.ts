import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type Evaluation = z.infer<typeof schemas.EvaluationSchema>;

export type EvaluationCreate = z.input<typeof schemas.EvaluationCreateSchema>;

export type EvaluationFilter = z.infer<typeof schemas.EvaluationFilterSchema>;
