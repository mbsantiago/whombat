import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type ClipAnnotation = z.infer<typeof schemas.ClipAnnotationSchema>;

export type ClipAnnotationFilter = z.infer<
  typeof schemas.ClipAnnotationFilterSchema
>;

export type ClipAnnotationTag = z.infer<typeof schemas.ClipAnnotationTagSchema>;

export type ClipAnnotationTagFilter = z.infer<
  typeof schemas.ClipAnnotationTagFilterSchema
>;

export type ClipAnnotationNote = z.infer<
  typeof schemas.ClipAnnotationNoteSchema
>;

export type ClipAnnotationNoteFilter = z.infer<
  typeof schemas.ClipAnnotationNoteFilterSchema
>;
