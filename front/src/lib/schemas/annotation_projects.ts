import { z } from "zod";

import { TagSchema } from "./tags";

export const AnnotationProjectSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  annotation_instructions: z.string().nullish(),
  tags: z.array(TagSchema).nullish(),
  created_on: z.coerce.date(),
});

export const AnnotationProjectCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  annotation_instructions: z.string().nullable().optional(),
});

export const AnnotationProjectUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  annotation_instructions: z.string().optional(),
});

export const AnnotationProjectImportSchema = z.object({
  annotation_project: z.instanceof(FileList),
});
