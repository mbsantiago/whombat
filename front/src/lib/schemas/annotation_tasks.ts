import { z } from "zod";

import { ClipAnnotationSchema } from "./clip_annotations";
import { ClipSchema } from "./clips";
import { UserSchema } from "./users";

export const AnnotationStatusSchema = z.enum([
  "assigned",
  "verified",
  "rejected",
  "completed",
]);

export const AnnotationStatusBadgeSchema = z.object({
  state: AnnotationStatusSchema,
  user: UserSchema.nullish(),
  created_on: z.coerce.date(),
});

export const AnnotationTaskSchema = z.object({
  uuid: z.string().uuid(),
  status_badges: z.array(AnnotationStatusBadgeSchema).nullish(),
  created_on: z.coerce.date(),
  clip: ClipSchema.nullish(),
  clip_annotation: ClipAnnotationSchema.nullish(),
});
