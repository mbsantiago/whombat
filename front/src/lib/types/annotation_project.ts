import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type AnnotationProject = z.infer<typeof schemas.AnnotationProjectSchema>;

export type AnnotationProjectFilter = z.infer<
  typeof schemas.AnnotationProjectFilterSchema
>;

export type AnnotationProjectCreate = z.input<
  typeof schemas.AnnotationProjectCreateSchema
>;

export type AnnotationProjectUpdate = z.input<
  typeof schemas.AnnotationProjectUpdateSchema
>;

export type AnnotationProjectImport = z.infer<
  typeof schemas.AnnotationProjectImportSchema
>;
