import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type EvaluationSet = z.infer<typeof schemas.EvaluationSetSchema>;

export type EvaluationSetFilter = z.infer<
  typeof schemas.EvaluationSetFilterSchema
>;

export type EvaluationSetCreate = z.input<
  typeof schemas.EvaluationSetCreateSchema
>;

export type EvaluationSetUpdate = z.input<
  typeof schemas.EvaluationSetUpdateSchema
>;

export type EvaluationSetImport = z.infer<
  typeof schemas.EvaluationSetImportSchema
>;
