import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type AnnotationStatus = z.infer<typeof schemas.AnnotationStatusSchema>;

export type AnnotationStatusBadge = z.infer<
  typeof schemas.AnnotationStatusBadgeSchema
>;

export type AnnotationTask = z.infer<typeof schemas.AnnotationTaskSchema>;

export type AnnotationTaskFilter = z.infer<
  typeof schemas.AnnotationTaskFilterSchema
>;
