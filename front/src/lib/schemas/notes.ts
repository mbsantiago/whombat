import { z } from "zod";

import { UserSchema } from "./users";

export const NoteSchema = z.object({
  uuid: z.string().uuid(),
  message: z.string(),
  is_issue: z.boolean(),
  created_by: UserSchema.nullish(),
  created_on: z.coerce.date(),
});

export const NoteCreateSchema = z.object({
  message: z.string(),
  is_issue: z.boolean(),
});

export const NoteUpdateSchema = z.object({
  message: z.string().optional(),
  is_issue: z.boolean().optional(),
});

export const NoteAssociationSchema = z.object({
  note: NoteSchema,
  created_by: UserSchema.nullish(),
  created_on: z.coerce.date(),
});
