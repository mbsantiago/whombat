import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type ClipPrediction = z.infer<typeof schemas.ClipPredictionSchema>;

export type ClipPredictionCreate = z.input<
  typeof schemas.ClipPredictionCreateSchema
>;

export type ClipPredictionFilter = z.infer<
  typeof schemas.ClipPredictionFilterSchema
>;
